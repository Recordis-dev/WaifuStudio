import assert from "node:assert/strict";
import { getPlayableAudioUrl, audioSchedule, stopAudioPlayback } from "../static/js/tabs/timeline.js";

console.log("--- Iniciando tests de lógica de Audio Multi-Pista de Timeline (Node) ---");

// Test 1: getPlayableAudioUrl resuelve URLs y paths web y descarta paths de disco local
{
  assert.equal(getPlayableAudioUrl({ url: "/media/audio1.mp3" }), "/media/audio1.mp3");
  assert.equal(getPlayableAudioUrl({ url: "https://example.com/sound.ogg" }), "https://example.com/sound.ogg");
  assert.equal(getPlayableAudioUrl({ source_path: "/media/uploads/bg.mp3" }), "/media/uploads/bg.mp3");
  assert.equal(getPlayableAudioUrl({ source_path: "blob:http://localhost:8765/abc-123" }), "blob:http://localhost:8765/abc-123");
  assert.equal(getPlayableAudioUrl({ source_path: "C:\\audio\\track.mp3" }), "", "Debe ignorar paths de disco Windows sin url");
  assert.equal(getPlayableAudioUrl({ source_path: "D:/audio/track.mp3" }), "", "Debe ignorar paths absolutos con letra de unidad sin url");
  assert.equal(getPlayableAudioUrl({ url: "", source_path: "" }), "", "Debe devolver string vacío si no hay ruta");
  assert.equal(getPlayableAudioUrl(null), "");
  console.log("✔ Test 1: getPlayableAudioUrl resuelve URLs web válidas y descarta rutas de disco locales");
}

// Test 2: audioSchedule ignora pistas muteadas (mute o muted)
{
  const tracks = [
    { url: "/media/track1.mp3", start_time: 0, volume: 1.0, mute: true },
    { url: "/media/track2.mp3", start_time: 1.0, volume: 0.8, muted: true },
    { url: "/media/track3.mp3", start_time: 2.0, volume: 0.5 },
  ];
  const scheduled = audioSchedule(tracks);
  assert.equal(scheduled.length, 1, "Solo la pista no muteada debe programarse");
  assert.equal(scheduled[0].url, "/media/track3.mp3");
  assert.equal(scheduled[0].startTime, 2.0);
  assert.equal(scheduled[0].volume, 0.5);
  console.log("✔ Test 2: audioSchedule ignora pistas muteadas (mute=true / muted=true)");
}

// Test 3: audioSchedule maneja start_time = 0 (inmediato) y start_time > 0 (diferido)
{
  const tracks = [
    { url: "/media/bgm.mp3", start_time: 0, volume: 0.7 },
    { url: "/media/sfx.mp3", start_time: 3.5, volume: 1.0 },
  ];
  const scheduled = audioSchedule(tracks);
  assert.equal(scheduled.length, 2);

  assert.equal(scheduled[0].immediate, true, "Pista con start_time 0 es inmediata");
  assert.equal(scheduled[0].startTime, 0);

  assert.equal(scheduled[1].immediate, false, "Pista con start_time 3.5 no es inmediata");
  assert.equal(scheduled[1].startTime, 3.5);
  console.log("✔ Test 3: audioSchedule detecta pistas inmediatas y diferidas por start_time");
}

// Test 4: audioSchedule normaliza y clampa el volumen al rango [0.0, 1.0]
{
  const tracks = [
    { url: "/media/loud.mp3", start_time: 0, volume: 1.8 },
    { url: "/media/silent.mp3", start_time: 0, volume: -0.5 },
    { url: "/media/default.mp3", start_time: 0, volume: null },
  ];
  const scheduled = audioSchedule(tracks);
  assert.equal(scheduled[0].volume, 1.0, "Volumen > 1.0 se clampa a 1.0");
  assert.equal(scheduled[1].volume, 0.0, "Volumen < 0.0 se clampa a 0.0");
  assert.equal(scheduled[2].volume, 1.0, "Volumen no numérico usa 1.0 por defecto");
  console.log("✔ Test 4: audioSchedule normaliza y clampa el volumen en rango válido");
}

// Test 5: Pista sin URL reproducible no rompe las demás
{
  const tracks = [
    { url: "", source_path: "E:\\raw\\unreachable.mp3", start_time: 0 },
    { url: "/media/valid.mp3", start_time: 1.2, volume: 0.9 },
    null,
    { url: "   ", start_time: 2.0 },
    { url: "/media/valid2.mp3", start_time: 0, volume: 0.4 },
  ];
  const scheduled = audioSchedule(tracks);
  assert.equal(scheduled.length, 2, "Debe omitir pistas inválidas o nulas sin lanzar error");
  assert.equal(scheduled[0].url, "/media/valid.mp3");
  assert.equal(scheduled[1].url, "/media/valid2.mp3");
  console.log("✔ Test 5: audioSchedule omite pistas sin URL reproducible sin romper las demás");
}

// Test 6: stopAudioPlayback no lanza errores y puede ejecutarse sin audios activos
{
  assert.doesNotThrow(() => {
    stopAudioPlayback();
  }, "stopAudioPlayback debe ser seguro de invocar en cualquier estado");
  console.log("✔ Test 6: stopAudioPlayback es idempotente y seguro");
}

console.log("=== TODOS LOS TESTS DE TIMELINE AUDIO PASARON EXITOSAMENTE ===");
