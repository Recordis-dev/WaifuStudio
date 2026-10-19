// Test unitario para BUG-QUEUE-01: verificación de recuperación de la cola ante fallos de red/polling
import assert from "node:assert/strict";

// Mock del entorno DOM/Browser mínimo para Node.js
const mockElement = (id) => ({
  id,
  classList: {
    toggle: () => {},
    add: () => {},
    remove: () => {},
  },
  style: {},
  disabled: false,
  textContent: "",
});

globalThis.window = {
  dispatchEvent: (event) => {
    window._events = window._events || [];
    window._events.push(event);
  },
  _events: [],
};

globalThis.document = {
  getElementById: (id) => mockElement(id),
  createElement: (tag) => mockElement(tag),
  addEventListener: () => {},
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || {};
  }
};

const { state } = await import("../static/js/state.js");
const { enqueueJobs } = await import("../static/js/api.js");

console.log("=== Ejecutando pruebas unitarias de recuperación de cola frontend (BUG-QUEUE-01) ===");

// Test 1: Fallo en polling (HTTP 404 o caída de red) no deja jobQueueRunning=true permanentemente
{
  state.jobQueue = [];
  state.jobQueueRunning = false;
  state.busy = false;
  state.activeJobsCount = 0;

  // Mock global fetch que rechaza simulando caída de servidor
  globalThis.fetch = async () => {
    return {
      ok: false,
      status: 404,
      json: async () => ({ error: "job no encontrado" }),
    };
  };

  let statusUpdates = [];
  const statusFn = (msg, isErr) => {
    statusUpdates.push({ msg, isErr });
  };

  let onDoneCalled = false;
  const onDone = async (job) => {
    onDoneCalled = true;
    assert.equal(job.status, "error");
  };

  await enqueueJobs(["job-falla-1"], { statusFn, onDone, manageCancel: false });

  // Dar tiempo al IIFE asíncrono para procesar y agotar el job
  await new Promise((resolve) => setTimeout(resolve, 1200));

  assert.equal(state.jobQueueRunning, false, "jobQueueRunning debe volver a false");
  assert.equal(state.busy, false, "state.busy debe volver a false");
  assert.equal(state.activeJobsCount, 0, "activeJobsCount debe ser 0");
  assert.ok(onDoneCalled, "onDone debe haber sido invocado con status=error");
  assert.ok(
    statusUpdates.some((u) => u.isErr && u.msg.includes("Error")),
    "Debe haberse reportado el error al usuario vía statusFn"
  );
  console.log("✔ Test 1: Fallo de polling limpia el estado y no bloquea jobQueueRunning");
}

// Test 2: Múltiples jobs en cola: si el primero falla, el segundo continúa y se procesa
{
  state.jobQueue = [];
  state.jobQueueRunning = false;
  state.busy = false;
  state.activeJobsCount = 0;

  let processed = [];

  globalThis.fetch = async (url) => {
    if (url.includes("job-fail")) {
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: "error interno ComfyUI" }),
      };
    }
    // job-success
    return {
      ok: true,
      status: 200,
      json: async () => ({ status: "done", outputs: [{ name: "result.png" }] }),
    };
  };

  await enqueueJobs(
    ["job-fail", "job-success"],
    {
      statusFn: () => {},
      onDone: async (job) => {
        processed.push(job.status);
      },
      manageCancel: false,
    }
  );

  // Esperar procesamiento de ambos jobs (1s por iteración de pollJob)
  await new Promise((resolve) => setTimeout(resolve, 2500));

  assert.deepEqual(processed, ["error", "done"], "Ambos jobs deben haberse procesado secuencialmente");
  assert.equal(state.jobQueueRunning, false, "jobQueueRunning debe ser false al terminar todos los jobs");
  assert.equal(state.busy, false, "state.busy debe ser false");
  console.log("✔ Test 2: El segundo job se procesa normalmente tras fallo del primero");
}

// Test 3: Tras un fallo anterior, un nuevo enqueueJobs posterior arranca la cola sin recargar página
{
  assert.equal(state.jobQueueRunning, false, "La cola debe estar libre para nuevos envíos");

  let thirdJobDone = false;
  globalThis.fetch = async () => {
    return {
      ok: true,
      status: 200,
      json: async () => ({ status: "done", outputs: [] }),
    };
  };

  await enqueueJobs(["job-nuevo"], {
    statusFn: () => {},
    onDone: async () => {
      thirdJobDone = true;
    },
    manageCancel: false,
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  assert.ok(thirdJobDone, "El nuevo trabajo posterior debe completarse exitosamente");
  assert.equal(state.jobQueueRunning, false);
  console.log("✔ Test 3: Nuevos envíos posteriores funcionan de inmediato sin recargar");
}

console.log("=== TODOS LOS TESTS DE RECUPERACIÓN DE COLA PASARON EXITOSAMENTE ===");
