export interface CompositionItem {
  id: number | null;
  compositionId: number | null;
  compositionName?: string | null;
  rawMaterialId: number | null;
  description: string;
  quantity: number | null;
  unitType: string | null;
  costType: string | null;
  unitCost: number | null;
  totalCost: number | null;
  serviceCost: number | null;
  percentage: number | null;
  active: boolean;
}
