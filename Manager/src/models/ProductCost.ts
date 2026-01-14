// src/models/ProdutoEstoque.ts

export interface ProductCost {
  id: number | null;
  productId: number | null;
  averageCost: number | null;
  grossValue: number | null;
  netValue: number | null;
  acquisitionValue: number | null;
  meanValue: number | null;
  freightValue: number | null;
  ipiValue: number | null;
  taxValue: number | null;
  commissionValue: number | null;
  icmsCreditValue: number | null;
  sellerCommission: number | null;
  brokerCommission: number | null;
  commissionPercentage: number | null;
}
