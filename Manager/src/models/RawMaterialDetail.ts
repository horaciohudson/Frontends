export interface RawMaterialDetail {
  id: number | null;
  rawMaterialId: number;
  rawMaterialName: string | null;
  technicalReferenceBase64: string | null;
  warrantyMonths: number | null;
  netValue: number | null;
  grossValue: number | null;
  acquisitionInterestValue: number | null;
  product: string | null;
}
