import { z } from "zod";
import type { WidgetConfig } from "./types.js";

export const widgetConfigSchema = z.object({
  siteKey: z.string().optional(),
  apiBaseUrl: z.string().url().optional(),
  language: z.string().optional(),
  position: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .optional(),
  widgetWidth: z.string().optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional(),
  enabledFeatures: z.array(z.string()).optional(),
  disabledFeatures: z.array(z.string()).optional(),
  enableAnalytics: z.boolean().optional(),
  enableCloudTts: z.boolean().optional(),
});

export const DEFAULT_WIDGET_CONFIG: Required<
  Omit<WidgetConfig, "siteKey" | "apiBaseUrl" | "enabledFeatures" | "disabledFeatures">
> &
  Pick<WidgetConfig, "siteKey" | "apiBaseUrl" | "enabledFeatures" | "disabledFeatures"> = {
  siteKey: undefined,
  apiBaseUrl: undefined,
  language: "ar",
  position: "bottom-right",
  widgetWidth: "380px",
  colors: {
    primary: "#0B5FFF",
    background: "#FFFFFF",
    text: "#111827",
    accent: "#10B981",
  },
  enabledFeatures: undefined,
  disabledFeatures: undefined,
  enableAnalytics: true,
  enableCloudTts: false,
};

export function mergeWidgetConfig(user?: Partial<WidgetConfig>): WidgetConfig {
  const parsed = widgetConfigSchema.safeParse(user ?? {});
  const safe = parsed.success ? parsed.data : {};
  return {
    ...DEFAULT_WIDGET_CONFIG,
    ...safe,
    colors: {
      ...DEFAULT_WIDGET_CONFIG.colors,
      ...(safe.colors ?? {}),
    },
  };
}
