import { describe, expect, it, beforeEach } from "vitest";
import { AccessibilityStore } from "./store.js";

describe("AccessibilityStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sets and resets features", () => {
    const store = new AccessibilityStore({ language: "ar" });
    store.set("bigger-text", "large");
    expect(store.get("bigger-text")).toBe("large");
    store.reset();
    expect(store.get("bigger-text")).toBeNull();
  });

  it("persists to localStorage", () => {
    const a = new AccessibilityStore();
    a.set("hide-images", true);
    const b = new AccessibilityStore();
    expect(b.get("hide-images")).toBe(true);
  });
});
