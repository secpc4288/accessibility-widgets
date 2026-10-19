export type FeatureCategory = "visual" | "cognitive" | "navigation" | "reader" | "profiles";

export type FeatureLevel = string | number | boolean;

export interface FeatureDefinition {
  id: string;
  category: FeatureCategory;
  levels?: FeatureLevel[];
  defaultLevel?: FeatureLevel;
}

export interface WidgetColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
}

export interface WidgetConfig {
  siteKey?: string;
  apiBaseUrl?: string;
  language?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  widgetWidth?: string;
  colors?: Partial<WidgetColors>;
  enabledFeatures?: string[];
  disabledFeatures?: string[];
  enableAnalytics?: boolean;
  enableCloudTts?: boolean;
}

export interface FeatureState {
  [featureId: string]: FeatureLevel | null;
}

export interface UsageEvent {
  siteKey: string;
  event: string;
  featureId?: string;
  timestamp: string;
  path?: string;
}

export type ProfileId =
  | "low-vision"
  | "epilepsy"
  | "adhd"
  | "dyslexia"
  | "seniors"
  | "blind"
  | "motor";

export interface AccessibilityProfile {
  id: ProfileId;
  labelKey: string;
  features: FeatureState;
}
