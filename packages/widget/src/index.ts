import { autoInit, initAccessibilityWidget } from "./init.js";

export { initAccessibilityWidget, autoInit };
export type { WidgetConfig } from "@a11y/core";

if (typeof window !== "undefined") {
  window.AccessibilityWidget = { init: initAccessibilityWidget };
  autoInit();
}
