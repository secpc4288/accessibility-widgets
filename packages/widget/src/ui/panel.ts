import { isRtl, t, type FeatureCategory } from "@a11y/core";
import type { AccessibilityStore } from "../state/store.js";
import type { FeatureModule } from "../features/types.js";
import { panelStyles, positionStyles } from "./styles.js";

const CATEGORY_ORDER: FeatureCategory[] = ["profiles", "visual", "cognitive", "navigation", "reader"];

export interface PanelApi {
  open: () => void;
  close: () => void;
  toggle: () => void;
  host: HTMLElement;
}

export function createPanel(
  store: AccessibilityStore,
  features: FeatureModule[],
  onApply: () => void,
): PanelApi {
  const cfg = store.config;
  const lang = cfg.language || "ar";
  const rtl = isRtl(lang);
  const primary = cfg.colors?.primary || "#0B5FFF";
  const width = cfg.widgetWidth || "380px";
  const pos = positionStyles(cfg.position || "bottom-right");

  const host = document.createElement("div");
  host.id = "a11y-platform-root";
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = panelStyles(primary, width);
  shadow.appendChild(style);

  const fab = document.createElement("button");
  fab.className = "fab";
  fab.type = "button";
  fab.setAttribute("aria-label", t(lang, "openMenu"));
  fab.setAttribute("aria-expanded", "false");
  fab.style.cssText = pos.fab;
  fab.innerHTML = `<svg class="a11y-keep" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><circle cx="12" cy="8" r="2" fill="white"/><path d="M7 18c1.5-3 8.5-3 10 0" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", t(lang, "menuTitle"));
  panel.style.cssText = pos.panel;
  panel.dir = rtl ? "rtl" : "ltr";

  const CATEGORIES = CATEGORY_ORDER.filter((c) => features.some((f) => f.category === c));
  let activeCategory: FeatureCategory | "all" = CATEGORIES[0] ?? "all";
  let query = "";

  const render = () => {
    const state = store.getState();
    const filtered = features.filter((f) => {
      const inCat = activeCategory === "all" || f.category === activeCategory;
      const label = t(lang, f.labelKey).toLowerCase();
      const q = query.trim().toLowerCase();
      return inCat && (!q || label.includes(q) || f.id.includes(q));
    });

    panel.innerHTML = `
      <div class="header">
        <h2 class="title" id="a11y-title">${t(lang, "menuTitle")}</h2>
        <button class="btn btn-ghost" type="button" data-action="close">${t(lang, "closeMenu")}</button>
      </div>
      <label class="sr-only" for="a11y-search">${t(lang, "search")}</label>
      <input class="search" id="a11y-search" type="search" placeholder="${t(lang, "search")}" value="${query.replace(/"/g, "&quot;")}" />
      <div class="tabs" role="tablist">
        ${CATEGORIES.map(
          (c) =>
            `<button class="tab" type="button" role="tab" data-cat="${c}" aria-selected="${activeCategory === c}">${t(lang, c)}</button>`,
        ).join("")}
      </div>
      <div class="grid" role="list">
        ${filtered
          .map((f) => {
            const val = state[f.id];
            const active = val !== undefined && val !== null && val !== false;
            return `<button class="feature" type="button" role="listitem" data-id="${f.id}" data-active="${active}">
              <span class="label">${t(lang, f.labelKey)}</span>
              <span class="meta">${active ? `${t(lang, "active")}${val !== true ? `: ${val}` : ""}` : t(lang, "inactive")}</span>
            </button>`;
          })
          .join("")}
      </div>
      <div class="footer">
        <button class="btn btn-ghost" type="button" data-action="reset">${t(lang, "reset")}</button>
      </div>
    `;

    panel.querySelector<HTMLInputElement>("#a11y-search")?.addEventListener("input", (e) => {
      query = (e.target as HTMLInputElement).value;
      render();
      panel.querySelector<HTMLInputElement>("#a11y-search")?.focus();
    });

    panel.querySelectorAll<HTMLButtonElement>("[data-cat]").forEach((btn) => {
      btn.onclick = () => {
        activeCategory = btn.dataset.cat as FeatureCategory;
        render();
      };
    });

    panel.querySelectorAll<HTMLButtonElement>("[data-id]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.id!;
        const feature = features.find((f) => f.id === id);
        if (!feature) return;
        const current = store.get(id);
        const levels = feature.levels ?? [true];
        if (current === null || current === undefined || current === false) {
          store.set(id, levels[0]!);
        } else {
          const idx = levels.findIndex((l) => l === current);
          if (idx >= 0 && idx < levels.length - 1) store.set(id, levels[idx + 1]!);
          else store.set(id, null);
        }
        onApply();
        render();
      };
    });

    panel.querySelector<HTMLButtonElement>('[data-action="close"]')!.onclick = () => api.close();
    panel.querySelector<HTMLButtonElement>('[data-action="reset"]')!.onclick = () => {
      store.reset();
      onApply();
      render();
    };
  };

  const api: PanelApi = {
    host,
    open() {
      panel.hidden = false;
      fab.setAttribute("aria-expanded", "true");
      render();
      panel.querySelector<HTMLElement>("#a11y-title")?.focus?.();
    },
    close() {
      panel.hidden = true;
      fab.setAttribute("aria-expanded", "false");
      fab.focus();
    },
    toggle() {
      if (panel.hidden) api.open();
      else api.close();
    },
  };

  fab.onclick = () => api.toggle();
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) api.close();
  });

  shadow.append(fab, panel);
  render();
  return api;
}
