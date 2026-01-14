export interface RawMaterialTax {
  id: number | null;
  rawMaterialId: number;
  rawMaterialName: string | null;
  classification: string | null;
  ipiRate: number | null;
  icmsRate: number | null;
  cicmsRate: number | null;
  taxRate: number | null;
  freightRate: number | null;
  acquisitionInterestRate: number | null;
  ipiAmount: number | null;
  icmsAmount: number | null;
  cicmsAmount: number | null;
  taxAmount: number | null;
  commissionAmount: number | null;
}
