export interface Composition {
  id: number | null;
  name: string;
  totalCost: number | null; // Allow null to match backend
  active: boolean;
}
