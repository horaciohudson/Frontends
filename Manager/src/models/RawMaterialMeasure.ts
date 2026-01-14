import { UnitType } from "../enums/UnitType";

export interface RawMaterialMeasure {
  id: number | null;
  rawMaterialId: number;
  rawMaterialName: string | null;
  unitType: UnitType | null;
  grossWeight: number | null;
  netWeight: number | null;
  length: number | null;
  width: number | null;
  boxQuantity: number | null;
}
