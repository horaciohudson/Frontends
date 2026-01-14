
export type PackagingType = "UNIT" | "PIECE" | "KILO" | "LITER" | "METER" | "PACKAGE" | "BOX";

export const packagingTypes: PackagingType[] = ["UNIT", "PIECE", "KILO", "LITER", "METER", "PACKAGE", "BOX"];

export const packagingI18nKey: Record<PackagingType, string> = {
  UNIT: "UNIT",
  PIECE: "PIECE",
  KILO: "KILO",
  LITER: "LITER",
  METER: "METER",
  PACKAGE: "PACKAGE",
  BOX: "BOX"
};





