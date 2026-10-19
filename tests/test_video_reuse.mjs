import assert from "node:assert/strict";
import { videoReuseParams } from "../static/js/tabs/video.js";

console.log("--- Iniciando tests de lógica de reuso de vídeo (Node) ---");

// Test 1: Modo V2V siempre fuerza perfil ref2va y variante vdn8
{
  const reused = videoReuseParams({
    mode: "v2v",
    profile: "rapido",
    variant: "turbo4",
    ref_video: "motion.mp4",
  });
  assert.equal(reused.mode, "v2v", "Modo debe ser v2v");
  assert.equal(reused.profile, "ref2va", "Perfil debe ser forzado a ref2va en v2v");
  assert.equal(reused.variant, "vdn8", "Variante debe ser forzada a vdn8 en v2v");
  assert.equal(reused.ref_video, "motion.mp4", "ref_video debe preservarse");
  console.log("✔ Test 1: V2V fuerza ref2va y vdn8");
}

// Test 2: Modo Ref2VA siempre fuerza perfil ref2va y variante vdn8 y preserva ref_images
{
  const reused = videoReuseParams({
    mode: "ref2va",
    profile: "calidad",
    variant: "turbo8",
    ref_images: ["char_1.png", "char_2.png"],
  });
  assert.equal(reused.mode, "ref2va", "Modo debe ser ref2va");
  assert.equal(reused.profile, "ref2va", "Perfil debe ser forzado a ref2va en ref2va");
  assert.equal(reused.variant, "vdn8", "Variante debe ser forzada a vdn8 en ref2va");
  assert.deepEqual(reused.ref_images, ["char_1.png", "char_2.png"], "ref_images debe preservarse");
  console.log("✔ Test 2: Ref2VA fuerza ref2va y vdn8 con ref_images");
}

// Test 3: Mapeo de modos flf2v e i2v (resto cae en i2v)
{
  const flf = videoReuseParams({ mode: "flf2v" });
  assert.equal(flf.mode, "flf2v", "flf2v debe mapear a flf2v");

  const fallback = videoReuseParams({ mode: "invalido" });
  assert.equal(fallback.mode, "i2v", "modo desconocido debe caer en i2v");

  const empty = videoReuseParams({});
  assert.equal(empty.mode, "i2v", "sin modo debe caer en i2v");
  console.log("✔ Test 3: Mapeo de modos flf2v e i2v");
}

// Test 4: Parámetros de Personalizado se restauran con valores explícitos
{
  const params = {
    mode: "i2v",
    profile: "personalizado",
    variant: "turbo8",
    encoder: "32b",
    lora_strength: 0.75,
    denoise: 0.8,
    sampler_name: "euler",
    scheduler: "karras",
    tile_size: 192,
    include_audio: false,
    sage: true,
    seconds: 10,
    width: 768,
    height: 1024,
    seed: 12345,
    prompt: "personaje anime corriendo",
  };
  const reused = videoReuseParams(params);
  assert.equal(reused.encoder, "32b", "encoder debe ser 32b");
  assert.equal(reused.lora_strength, 0.75, "lora_strength debe ser 0.75");
  assert.equal(reused.denoise, 0.8, "denoise debe ser 0.8");
  assert.equal(reused.sampler_name, "euler", "sampler_name debe ser euler");
  assert.equal(reused.scheduler, "karras", "scheduler debe ser karras");
  assert.equal(reused.tile_size, 192, "tile_size debe ser 192");
  assert.equal(reused.include_audio, false, "include_audio debe ser false");
  assert.equal(reused.sage, true, "sage debe ser true");
  assert.equal(reused.seconds, 10, "seconds debe ser 10");
  assert.equal(reused.width, 768, "width debe ser 768");
  assert.equal(reused.height, 1024, "height debe ser 1024");
  assert.equal(reused.seed, 12345, "seed debe ser 12345");
  assert.equal(reused.prompt, "personaje anime corriendo", "prompt debe preservarse");
  console.log("✔ Test 4: Personalizado restaura todos los controles explícitos");
}

// Test 5: Parámetros de Personalizado mantienen defaults ante ausencia de campos
{
  const reused = videoReuseParams({});
  assert.equal(reused.encoder, "4b", "encoder default es 4b");
  assert.equal(reused.lora_strength, 1.0, "lora_strength default es 1.0");
  assert.equal(reused.denoise, 1.0, "denoise default es 1.0");
  assert.equal(reused.sampler_name, "res_multistep", "sampler_name default es res_multistep");
  assert.equal(reused.scheduler, "simple", "scheduler default es simple");
  assert.equal(reused.tile_size, 256, "tile_size default es 256");
  assert.equal(reused.include_audio, true, "include_audio default es true");
  assert.equal(reused.sage, false, "sage default es false");
  console.log("✔ Test 5: Personalizado mantiene defaults seguros");
}

console.log("=== TODOS LOS TESTS DE REUSO DE VÍDEO PASARON EXITOSAMENTE ===");
