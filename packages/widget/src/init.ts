import type { WidgetConfig } from "@a11y/core";
import { isReleasedFeature, mergeWidgetConfig } from "@a11y/core";
import { AccessibilityStore } from "./state/store.js";
import { FeatureRegistry } from "./features/registry.js";
import { createProfileFeatures } from "./features/profiles.js";
import { readingModeFeature } from "./reader/reading-mode.js";
import { createPanel } from "./ui/panel.js";
import { track } from "./analytics.js";

declare global {
  interface Window {
    ACCESSIBILITY_WIDGET_CONFIG?: Partial<WidgetConfig>;
    AccessibilityWidget?: { init: typeof initAccessibilityWidget };
  }
}

function announce(message: string): void {
  let live = document.getElementById("a11y-live-region");
  if (!live) {
    live = document.createElement("div");
    live.id = "a11y-live-region";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    Object.assign(live.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
    });
    document.body.appendChild(live);
  }
  live.textContent = "";
  requestAnimationFrame(() => {
    live!.textContent = message;
  });
}

async function fetchRemoteConfig(config: WidgetConfig): Promise<Partial<WidgetConfig>> {
  if (!config.siteKey || !config.apiBaseUrl) return {};
  try {
    const res = await fetch(
      `${config.apiBaseUrl.replace(/\/$/, "")}/v1/config/${encodeURIComponent(config.siteKey)}`,
      { mode: "cors" },
    );
    if (!res.ok) return {};
    return (await res.json()) as Partial<WidgetConfig>;
  } catch {
    return {};
  }
}

export async function initAccessibilityWidget(userConfig?: Partial<WidgetConfig>): Promise<void> {
  if (document.getElementById("a11y-platform-root")) return;

  const boot = mergeWidgetConfig({
    ...(window.ACCESSIBILITY_WIDGET_CONFIG ?? {}),
    ...(userConfig ?? {}),
  });
  const remote = await fetchRemoteConfig(boot);
  const store = new AccessibilityStore({ ...boot, ...remote });

  const registry = new FeatureRegistry(announce);
  const applyAll = () => {
    registry.applyState(store.getState());
    track(store.config, "apply", undefined);
  };

  for (const pf of createProfileFeatures(store, applyAll)) registry.register(pf);
  registry.register({
    ...readingModeFeature,
    levels: [true],
    apply: (level) => readingModeFeature.apply(level),
  });

  const { enabledFeatures, disabledFeatures } = store.config;
  registry.retain(
    (id) =>
      isReleasedFeature(id) &&
      (!enabledFeatures?.length || enabledFeatures.includes(id)) &&
      !disabledFeatures?.includes(id),
  );
  const features = registry.list();

  const panel = createPanel(store, features, () => {
    applyAll();
    track(store.config, "feature_toggle");
  });

  document.body.appendChild(panel.host);
  applyAll();
  track(store.config, "widget_init");

  if (store.config.language && !document.documentElement.lang) {
    document.documentElement.lang = store.config.language;
  }
}

export function autoInit(): void {
  const run = () => {
    void initAccessibilityWidget();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
