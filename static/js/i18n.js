// WaifuStudio — Sistema de Internacionalización (M20 T-05)
// Qué hace: traducciones dinámicas ES <-> EN en toda la app, mapa de selectores DOM y soporte [data-i18n].
// Dependencias: static/js/dom.js.

import { $ } from "./dom.js";

export const TRANSLATIONS = {
  es: {
    tab_image: "Imagen",
    tab_video: "Vídeo",
    tab_editor: "Editor",
    tab_timeline: "🎬 Estudio",
    tab_upscaler: "Upscaler",
    tab_gallery: "Galería",
    tab_guide: "📖 Guía",
    tab_test: "TEST",
    generate: "Generar Imagen",
    cancel: "Cancelar",
    video_generate: "Generar Vídeo",
    upscale_run: "Escalar",
    export_mp4: "🎬 Exportar MP4",
    ai_generate: "✨ Generar con IA",
    play_all: "▶️ Reproducir Todo",
    new_project: "+ Nuevo Proyecto",
    save_project: "💾 Guardar Proyecto",
    add_audio: "+ Añadir Audio",
    enhance: "✨ Enriquecer con IA",
    oc_maker: "OC Maker",
    choose_loras: "Elegir LoRAs",
    manage_library: "Gestionar biblioteca",
    preprompts: "Preprompts",
    refresh: "Refrescar",
    clean_failed: "Limpiar Fallidos",
    custom_tags: "Mis Tags",
    queue_prefix: "Encolar",
    ph_prompt: "Describe tu waifu...",
    ph_negative: "Elementos negativos...",
    ph_editor_prompt: "Describe los cambios...",
    ph_timeline_prompt: "Describe la acción o escena a generar...",
    ph_guide_search: "Buscar en la guía...",
    ph_gallery_search: "Buscar por tags...",
    ph_project_name: "Nombre del proyecto...",
  },
  en: {
    tab_image: "Image",
    tab_video: "Video",
    tab_editor: "Editor",
    tab_timeline: "🎬 Studio",
    tab_upscaler: "Upscaler",
    tab_gallery: "Gallery",
    tab_guide: "📖 Guide",
    tab_test: "TEST",
    generate: "Generate Image",
    cancel: "Cancel",
    video_generate: "Generate Video",
    upscale_run: "Upscale",
    export_mp4: "🎬 Export MP4",
    ai_generate: "✨ AI Generate",
    play_all: "▶️ Play All",
    new_project: "+ New Project",
    save_project: "💾 Save Project",
    add_audio: "+ Add Audio",
    enhance: "✨ Enhance with AI",
    oc_maker: "OC Maker",
    choose_loras: "Select LoRAs",
    manage_library: "Manage Library",
    preprompts: "Preprompts",
    refresh: "Refresh",
    clean_failed: "Clean Failed",
    custom_tags: "Custom Tags",
    queue_prefix: "Queue",
    ph_prompt: "Describe your waifu...",
    ph_negative: "Negative elements...",
    ph_editor_prompt: "Describe changes...",
    ph_timeline_prompt: "Describe action or scene to generate...",
    ph_guide_search: "Search the guide...",
    ph_gallery_search: "Search by tags...",
    ph_project_name: "Project name...",
  }
};
TRANSLATIONS.ES = TRANSLATIONS.es;
TRANSLATIONS.EN = TRANSLATIONS.en;

const SELECTOR_MAP = [
  // Navbar tabs
  { sel: "#tab-image", es: "Imagen", en: "Image" },
  { sel: "#tab-video", es: "Vídeo", en: "Video" },
  { sel: "#tab-editor", es: "Editor", en: "Editor" },
  { sel: "#tab-timeline", es: "🎬 Estudio", en: "🎬 Studio" },
  { sel: "#tab-upscaler", es: "Upscaler", en: "Upscaler" },
  { sel: "#tab-gallery", es: "Galería", en: "Gallery" },
  { sel: "#tab-guide", es: "📖 Guía", en: "📖 Guide" },
  { sel: "#tab-test", es: "TEST", en: "TEST" },

  // Botones principales y acciones
  { sel: "#btn-generate", es: "Generar", en: "Generate", isQueueBtn: true },
  { sel: "#btn-cancel", es: "Cancelar", en: "Cancel" },
  { sel: "#btn-video-generate", es: "Generar", en: "Generate", isQueueBtn: true },
  { sel: "#btn-video-cancel", es: "Cancelar", en: "Cancel" },
  { sel: "#btn-editor-generate", es: "Generar", en: "Generate", isQueueBtn: true },
  { sel: "#btn-upscale", es: "Escalar", en: "Upscale", isQueueBtn: true },
  { sel: "#btn-upscale-cancel", es: "Cancelar", en: "Cancel" },
  { sel: "#btn-timeline-export", es: "🎬 Exportar MP4", en: "🎬 Export MP4" },
  { sel: "#btn-timeline-ai-generate", es: "✨ Generar con IA", en: "✨ AI Generate", isQueueBtn: true },
  { sel: "#btn-timeline-play-all", es: "▶️ Reproducir Todo", en: "▶️ Play All" },
  { sel: "#btn-timeline-new", es: "+ Nuevo Proyecto", en: "+ New Project" },
  { sel: "#btn-timeline-save", es: "💾 Guardar Proyecto", en: "💾 Save Project" },
  { sel: "#btn-timeline-add-audio", es: "+ Añadir Audio", en: "+ Add Audio" },
  { sel: "#btn-timeline-refresh-media", es: "Refrescar", en: "Refresh" },
  { sel: "#btn-enhance", es: "Generar prompt", en: "Generate prompt" },
  { sel: "#btn-h3-prompt", es: "✨ Generar con IA", en: "✨ AI Generate" },
  { sel: "#btn-lora-modal", es: "Elegir LoRAs", en: "Select LoRAs" },
  { sel: "#btn-lora-manage", es: "Gestionar biblioteca", en: "Manage Library" },
  { sel: "#btn-preprompt-manage", es: "Preprompts", en: "Preprompts" },
  { sel: "#btn-gallery-refresh", es: "Refrescar", en: "Refresh" },
  { sel: "#btn-gallery-clean-failed", es: "Limpiar Fallidos", en: "Clean Failed" },
  { sel: "#btn-manage-custom-tags", es: "Mis Tags", en: "Custom Tags" },
  { sel: "#btn-download-image", es: "Descargar", en: "Download" },
  { sel: "#btn-save-to-oc", es: "Guardar en OC", en: "Save to OC" },
  { sel: "#btn-new-generation", es: "Nueva", en: "New" },
  { sel: "#btn-describe-image", es: "Describir", en: "Describe" },
  { sel: "#btn-describe-ref", es: "Describir Ref", en: "Describe Ref" },
  { sel: "#btn-h3-insert-template", es: "Plantilla", en: "Template" },
  { sel: "#btn-h3-copy-guide", es: "Copiar Guía", en: "Copy Guide" },
  { sel: "#btn-editor-open-gallery", es: "Ver Galería", en: "View Gallery" },
  { sel: "#btn-editor-download", es: "Descargar", en: "Download" },
  { sel: "#btn-upscale-compare", es: "Comparar", en: "Compare" },
  { sel: "#btn-image-compare", es: "Comparar", en: "Compare" },
  { sel: "#btn-editor-compare", es: "Comparar", en: "Compare" },

  // Leyendas de bloques/tarjetas
  { sel: "#panel-timeline legend:nth-of-type(1)", es: "1. Proyecto & Exportación", en: "1. Project & Export" },
  { sel: "#panel-timeline legend:nth-of-type(2)", es: "2. Biblioteca de Medios", en: "2. Media Library" },
  { sel: "#panel-timeline legend:nth-of-type(3)", es: "3. Generar en Timeline con IA", en: "3. Generate on Timeline with AI" },

  // Guía Interactiva: Hero & Pasos
  { sel: "#panel-guide .guide-hero h2", es: "Bienvenido a WaifuStudio — Guía Interactiva de Producción", en: "Welcome to WaifuStudio — Interactive Production Guide" },
  { sel: "#panel-guide .guide-hero > p", es: "Flujo integral de creación: desde el diseño conceptual de tu personaje hasta la animación de episodios de más de 3 minutos y escalado cinematográfico en 2K a 60 FPS, 100% en local sin censura.", en: "Comprehensive creation workflow: from conceptual character design to 3+ minute animated episodes and 2K 60 FPS cinematic upscaling, 100% local and uncensored." },
  { sel: "#panel-guide .guide-step-card:nth-child(1) h3", es: "🎨 Paso 1: Crea tu Personaje", en: "🎨 Step 1: Create your Character" },
  { sel: "#panel-guide .guide-step-card:nth-child(1) p", es: "Diseña tu waifu con Anima 2.9B o SDXL, guarda su identidad en OC Maker y genera su hoja de vistas.", en: "Design your waifu with Anima 2.9B or SDXL, save identity in OC Maker and generate character sheets." },
  { sel: "#panel-guide .guide-step-card:nth-child(1) button", es: "Ir a Imagen →", en: "Go to Image →" },
  { sel: "#panel-guide .guide-step-card:nth-child(2) h3", es: "🎞️ Paso 2: Anima en 8 Pasos", en: "🎞️ Step 2: Animate in 8 Steps" },
  { sel: "#panel-guide .guide-step-card:nth-child(2) p", es: "Genera clips con H3 VideoDeltaNet en segundos usando I2V, o mantén su identidad con Ref2VA.", en: "Generate clips with H3 VideoDeltaNet in seconds using I2V, or preserve identity with Ref2VA." },
  { sel: "#panel-guide .guide-step-card:nth-child(2) button", es: "Ir a Vídeo →", en: "Go to Video →" },
  { sel: "#panel-guide .guide-step-card:nth-child(3) h3", es: "🎬 Paso 3: Monta en Estudio", en: "🎬 Step 3: Edit in Studio" },
  { sel: "#panel-guide .guide-step-card:nth-child(3) p", es: "Organiza tus clips en la línea de tiempo, añade música y usa 'Continuar I2V' para secuencias largas.", en: "Organize clips on the timeline, add music, and use 'Continue I2V' for long sequences." },
  { sel: "#panel-guide .guide-step-card:nth-child(3) button", es: "Ir a Estudio →", en: "Go to Studio →" },
  { sel: "#panel-guide .guide-step-card:nth-child(4) h3", es: "🔍 Paso 4: Escala a 2K / 60 FPS", en: "🔍 Step 4: Scale to 2K / 60 FPS" },
  { sel: "#panel-guide .guide-step-card:nth-child(4) p", es: "Aplica Upscaler Pro 2.0 con RCAS y RIFE para fluidez cinematográfica a 60 fotogramas por segundo.", en: "Apply Upscaler Pro 2.0 with RCAS and RIFE for cinematic 60 FPS smoothness." },
  { sel: "#panel-guide .guide-step-card:nth-child(4) button", es: "Ir a Upscaler →", en: "Go to Upscaler →" },

  // Guía Toolbar Nav
  { sel: '#guide-nav [data-filter="all"]', es: "Todos los Módulos", en: "All Modules" },
  { sel: '#guide-nav [data-filter="image"]', es: "1. Imagen & OC", en: "1. Image & OC" },
  { sel: '#guide-nav [data-filter="video"]', es: "2. Vídeo H3", en: "2. Video H3" },
  { sel: '#guide-nav [data-filter="editor"]', es: "3. Editor Qwen", en: "3. Qwen Editor" },
  { sel: '#guide-nav [data-filter="timeline"]', es: "4. Estudio Timeline", en: "4. Studio Timeline" },
  { sel: '#guide-nav [data-filter="upscale"]', es: "5. Upscaler Pro", en: "5. Upscaler Pro" },
  { sel: '#guide-nav [data-filter="faq"]', es: "FAQ & Trucos", en: "FAQ & Tips" },

  // Guía Títulos de Secciones
  { sel: '.guide-section[data-category="image"] h3', es: "1. 🎨 Imagen & OC Maker (Diseño de Personajes)", en: "1. 🎨 Image & OC Maker (Character Design)" },
  { sel: '.guide-section[data-category="video"] h3', es: "2. 🎞️ Vídeo H3 (I2V / FLF2V / Ref2VA / V2V)", en: "2. 🎞️ Video H3 (I2V / FLF2V / Ref2VA / V2V)" },
  { sel: '.guide-section[data-category="editor"] h3', es: "3. 🖌️ Editor Qwen 2.1 (Inpaint & Presets de Pose)", en: "3. 🖌️ Qwen 2.1 Editor (Inpaint & Pose Presets)" },
  { sel: '.guide-section[data-category="timeline"] h3', es: "4. 🎬 Estudio / Timeline (Montaje de Miniseries)", en: "4. 🎬 Studio / Timeline (Miniseries Assembly)" },
  { sel: '.guide-section[data-category="upscale"] h3', es: "5. 🔍 Upscaler Pro 2.0 & Galería", en: "5. 🔍 Upscaler Pro 2.0 & Gallery" },
  { sel: '.guide-section[data-category="faq"] h3', es: "💡 Recetario de Trucos Pro & Preguntas Frecuentes", en: "💡 Pro Tips & Frequently Asked Questions" },

  // Placeholders
  { sel: "#prompt-general", placeholder: { es: "Describe tu waifu...", en: "Describe your waifu..." } },
  { sel: "#negative", placeholder: { es: "Elementos negativos...", en: "Negative elements..." } },
  { sel: "#editor-prompt", placeholder: { es: "Describe los cambios...", en: "Describe changes..." } },
  { sel: "#timeline-ai-prompt", placeholder: { es: "Describe la acción o escena a generar...", en: "Describe action or scene to generate..." } },
  { sel: "#timeline-project-name", placeholder: { es: "Nombre del proyecto...", en: "Project name..." } },
  { sel: "#guide-search", placeholder: { es: "Buscar en la guía...", en: "Search the guide..." } },
  { sel: "#gallery-tag-search", placeholder: { es: "Buscar por tags...", en: "Search by tags..." } }
];

export function getCurrentLang() {
  return (localStorage.getItem("waifu_lang") || "es").toLowerCase();
}

export function t(key, lang = getCurrentLang()) {
  const l = (lang || "es").toLowerCase();
  const dict = TRANSLATIONS[l] || TRANSLATIONS.es;
  return dict[key] || TRANSLATIONS.es[key] || key;
}

function updateElementText(el, text) {
  const hasElementChildren = Array.from(el.childNodes).some((n) => n.nodeType === Node.ELEMENT_NODE);
  if (hasElementChildren) {
    let updated = false;
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        if (!updated) {
          node.textContent = text + " ";
          updated = true;
        } else {
          node.textContent = "";
        }
      }
    });
    if (!updated) {
      el.insertBefore(document.createTextNode(text + " "), el.firstChild);
    }
    return;
  }
  el.textContent = text;
}

export function applyLanguage(lang) {
  const l = (lang || getCurrentLang()).toLowerCase();
  const isEn = l === "en";
  localStorage.setItem("waifu_lang", l);

  const label = $("lang-current-label");
  if (label) label.textContent = l.toUpperCase();

  document.querySelectorAll(".lang-option").forEach((opt) => {
    opt.classList.toggle("active", (opt.dataset.lang || "").toLowerCase() === l);
  });

  SELECTOR_MAP.forEach((item) => {
    const el = document.querySelector(item.sel);
    if (!el) return;

    if (item.placeholder) {
      el.placeholder = isEn ? item.placeholder.en : item.placeholder.es;
      return;
    }

    if (item.isQueueBtn && el.textContent.includes("(")) {
      const match = el.textContent.match(/\((\d+)\)/);
      if (match) {
        el.textContent = isEn ? `Queue (${match[1]})` : `Encolar (${match[1]})`;
        return;
      }
    }

    const newText = isEn ? item.en : item.es;
    if (newText) {
      updateElementText(el, newText);
    }
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = t(key, l);
    if (val) updateElementText(el, val);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = t(key, l);
    if (val) el.placeholder = val;
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const val = t(key, l);
    if (val) el.title = val;
  });

  window.dispatchEvent(new CustomEvent("waifu:languagechange", { detail: { lang: l } }));
  window.dispatchEvent(new CustomEvent("waifu:language-changed", { detail: { lang: l } }));
}

export function initI18n() {
  const lang = getCurrentLang();
  applyLanguage(lang);
}
