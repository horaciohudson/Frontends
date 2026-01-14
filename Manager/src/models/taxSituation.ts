// ✅ models/TaxSituation.ts

export interface TaxSituation {
  id: number;
  code: string;
  name: string;
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
}
