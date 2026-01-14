export const TRANSLATION_NAMESPACES = {
  COMMON: "common",
  REFERENCE: "reference",
  COMMERCIAL: "commercial",
  FINANCIAL: "financial",
  PRINCIPAL: "principal",
  SPECIFIC: "specific",
  ENUMS: "enums",
  CHART_ACCOUNT: "chartAccount",
  TAX_SITUATION: "taxSituation",
  TEST: "test",
  SIMPLE: "simple"
} as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[keyof typeof TRANSLATION_NAMESPACES];









