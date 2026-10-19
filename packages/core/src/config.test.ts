import { describe, expect, it } from "vitest";
import { mergeWidgetConfig } from "./config.js";
import { FEATURE_CATALOG } from "./features.js";

describe("mergeWidgetConfig", () => {
  it("defaults to Arabic RTL-first language", () => {
    const cfg = mergeWidgetConfig();
    expect(cfg.language).toBe("ar");
    expect(cfg.position).toBe("bottom-right");
  });

  it("merges custom colors", () => {
    const cfg = mergeWidgetConfig({ colors: { primary: "#123456" } });
    expect(cfg.colors?.primary).toBe("#123456");
    expect(cfg.colors?.background).toBe("#FFFFFF");
  });
});

describe("FEATURE_CATALOG", () => {
  it("contains 40+ features", () => {
    expect(FEATURE_CATALOG.length).toBeGreaterThanOrEqual(40);
  });
});
