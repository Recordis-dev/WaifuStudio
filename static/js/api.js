// WaifuStudio — Cliente HTTP y Polling de Trabajos
// Qué hace: fetch centralizado, postJson, putJson, pollJob y cancelJob.
// Qué no hace: no maneja estado de UI local ni manipulación directa del DOM.
// Dependencias: static/js/state.js y static/js/dom.js.

import { state } from "./state.js";
import { $, setStatus, setVideoStatus, setEditorStatus, setUpscaleStatus, setProgress } from "./dom.js";

async function api(path, options = {}) {
  const { timeoutMs, ...fetchOptions } = options;
  let timer = null;
  let controller = null;

  if (typeof timeoutMs === "number" && timeoutMs > 0) {
    controller = new AbortController();
    if (fetchOptions.signal) {
      if (fetchOptions.signal.aborted) {
        controller.abort();
      } else {
        fetchOptions.signal.addEventListener("abort", () => controller.abort());
      }
    }
    fetchOptions.signal = controller.signal;
    timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
  }

  try {
    const response = await fetch(path, fetchOptions);
    let data = null;
    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }
    if (!response.ok) {
      const error = new Error(
        data?.error || data?.detail || `HTTP ${response.status}`
      );
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (err) {
    if ((controller && controller.signal.aborted) || err.name === "AbortError") {
      const isTimeout = controller && controller.signal.aborted;
      const error = new Error(
        isTimeout
          ? `Tiempo de espera agotado (${timeoutMs} ms)`
          : (err.message || "Petición abortada")
      );
      error.status = 0;
      throw error;
    }
    throw err;
  } finally {
    if (timer !== null) {
      clearTimeout(timer);
    }
  }
}

function postJson(path, payload) {
  return api(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function putJson(path, payload) {
  return api(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}


function setCancelVisible(visible, buttonId = "btn-cancel") {
  $(buttonId).classList.toggle("hidden", !visible);
}

async function cancelJob(event, statusFnOverride = null) {
  const jobId = state.activeJobId;
  if (!jobId) {
    return;
  }
  const button = event && event.currentTarget ? event.currentTarget : $("btn-cancel");
  const statusFn =
    statusFnOverride ||
    (button.id === "btn-video-cancel"
      ? setVideoStatus
      : button.id === "btn-upscale-cancel"
      ? setUpscaleStatus
      : setStatus);
  button.disabled = true;
  try {
    await api(`/api/jobs/${encodeURIComponent(jobId)}/cancel`, { method: "POST" });
    statusFn("Cancelado");
  } catch (error) {
    statusFn(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function pollJob(
  jobId,
  statusFn = setStatus,
  onDone = null,
  progressFn = setProgress,
  manageCancel = true,
  cancelButtonId = "btn-cancel"
) {
  if (manageCancel) {
    state.activeJobId = jobId;
    setCancelVisible(true, cancelButtonId);
  }
  let lastStatus = null;
  let invalidResponses = 0;
  try {
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const payload = await api(`/api/jobs/${encodeURIComponent(jobId)}`, { timeoutMs: 15000 });
      if (!payload || typeof payload !== "object" || typeof payload.status !== "string") {
        invalidResponses += 1;
        if (invalidResponses < 3) {
          statusFn("Esperando estado del job...");
          continue;
        }
        throw new Error(
          "El servidor no devolvió un estado válido del job; revisa la Galería o reinicia la app."
        );
      }
      invalidResponses = 0;
      const job = payload;
      if (job.status !== lastStatus) {
        lastStatus = job.status;
        window.dispatchEvent(
          new CustomEvent("waifu:queue-updated", {
            detail: { count: state.activeJobsCount, status: job.status },
          })
        );
      }
      if (job.status === "queued" || job.status === "running") {
        if (progressFn) {
          progressFn(job.progress);
        }
        statusFn(job.status === "running" ? "Generando..." : "En cola...");
        continue;
      }
      if (job.status === "error") {
        statusFn(`Error: ${job.error || "desconocido"}`, true);
        if (onDone) {
          await onDone(job);
        }
        return;
      }
      if (job.status === "cancelled") {
        statusFn("Cancelado");
        if (onDone) {
          await onDone(job);
        }
        return;
      }
      statusFn("Listo");
      if (onDone) {
        await onDone(job);
      }
      return;
    }
  } finally {
    if (manageCancel) {
      if (state.activeJobId === jobId) {
        state.activeJobId = null;
      }
      setCancelVisible(false, cancelButtonId);
    }
    if (progressFn) {
      progressFn(null);
    }
  }
}


async function enqueueJobs(jobIds, options = {}) {
  const ids = (Array.isArray(jobIds) ? jobIds : [jobIds]).filter(Boolean);
  for (const id of ids) {
    state.jobQueue.push({ jobId: id, ...options });
  }

  state.activeJobsCount = state.jobQueue.length + (state.jobQueueRunning ? 1 : 0);
  window.dispatchEvent(
    new CustomEvent("waifu:queue-updated", { detail: { count: state.activeJobsCount } })
  );

  if (state.activeJobsCount > 1 && options.statusFn) {
    options.statusFn("En cola (" + state.activeJobsCount + " tareas)...");
  }

  if (!state.jobQueueRunning) {
    (async () => {
      state.jobQueueRunning = true;
      state.busy = true;
      try {
        while (state.jobQueue.length > 0) {
          const item = state.jobQueue.shift();
          state.activeJobsCount = state.jobQueue.length + 1;
          window.dispatchEvent(
            new CustomEvent("waifu:queue-updated", { detail: { count: state.activeJobsCount } })
          );

          try {
            await pollJob(
              item.jobId,
              item.statusFn,
              item.onDone,
              item.progressFn,
              item.manageCancel,
              item.cancelButtonId
            );
          } catch (jobError) {
            console.error(`[enqueueJobs] Error durante el polling del trabajo ${item.jobId}:`, jobError);
            if (item.statusFn) {
              item.statusFn(`Error: ${jobError && jobError.message ? jobError.message : "Fallo de conexión"}`, true);
            }
            if (item.onDone) {
              try {
                await item.onDone({
                  status: "error",
                  error: jobError && jobError.message ? jobError.message : "Fallo de conexión",
                  jobId: item.jobId,
                  gen_id: item.jobId,
                  outputs: [],
                  params: {},
                });
              } catch (onDoneErr) {
                console.error("[enqueueJobs] Error en callback onDone:", onDoneErr);
              }
            }
          }

          state.activeJobsCount = state.jobQueue.length + (state.jobQueue.length > 0 ? 1 : 0);
          window.dispatchEvent(
            new CustomEvent("waifu:queue-updated", { detail: { count: state.activeJobsCount } })
          );
        }
      } finally {
        state.busy = false;
        state.jobQueueRunning = false;
        state.activeJobsCount = 0;
        window.dispatchEvent(
          new CustomEvent("waifu:queue-updated", { detail: { count: 0 } })
        );
      }
    })();
  }
}

export {
  api,
  postJson,
  putJson,
  setCancelVisible,
  cancelJob,
  pollJob,
  enqueueJobs,
};
