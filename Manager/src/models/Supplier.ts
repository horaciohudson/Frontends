// models/Supplier.ts
export interface Supplier {
  supplierId?: number;
  companyId: number;
  tradeName: string;
  deliveryTime: number;
  paymentMethod: number;
}

