// WaifuStudio — Pestaña Guía Interactiva (M20 T-04)
// Qué hace: navegación de inicio rápido hacia pestañas, filtrado temático, búsqueda reactiva y acordeones FAQ.
// Dependencias: static/js/dom.js.

import { $, on } from "../dom.js";

let activeFilter = "all";

function applyFilters() {
  const searchInput = $("guide-search");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const sections = document.querySelectorAll(".guide-section");

  sections.forEach((sec) => {
    const category = sec.dataset.category || "";
    const matchesCategory = activeFilter === "all" || category === activeFilter;
    const matchesSearch = !query || sec.textContent.toLowerCase().includes(query);

    sec.classList.toggle("hidden", !(matchesCategory && matchesSearch));
  });
}

function handleGotoTab(e) {
  const btn = e.target.closest("[data-goto-tab]");
  if (!btn) return;
  const target = btn.dataset.gotoTab;
  if (!target) return;
  const tabBtn = $(`tab-${target}`) || document.querySelector(`.tab[data-tab="${target}"]`);
  if (tabBtn) {
    tabBtn.click();
  }
}

export function initGuideTab() {
  const panel = $("panel-guide");
  if (!panel) return;

  // Delegación para botones "Ir a..." de Inicio Rápido
  panel.addEventListener("click", handleGotoTab);

  // Filtros por módulo (Barra superior)
  const nav = $("guide-nav");
  if (nav) {
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".guide-nav-btn");
      if (!btn) return;
      nav.querySelectorAll(".guide-nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter || "all";
      applyFilters();
    });
  }

  // Buscador en tiempo real
  const searchInput = $("guide-search");
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // Acordeones colapsables para FAQ
  panel.querySelectorAll(".guide-accordion").forEach((acc) => {
    const header = acc.querySelector(".guide-acc-header");
    const body = acc.querySelector(".guide-acc-body");
    if (!header || !body) return;

    // Colapsado por defecto
    body.classList.add("hidden");

    header.addEventListener("click", () => {
      const isHidden = body.classList.contains("hidden");
      body.classList.toggle("hidden", !isHidden);
      const icon = header.querySelector("span:last-child");
      if (icon) {
        icon.textContent = isHidden ? "▲" : "▼";
      }
    });
  });
}
