import { ProductOperationType } from "../enums/ProductOperationType";

export interface ProductHistory {
  id: number | null;
  productId: number | null;
  operationType: ProductOperationType | null;
  operationDate: string | Date | null;
  quantity: number | null;
  totalValue: number | null;
  userName: string | null;
  note: string | null;
  lastSaleUser: string | null;
  lastPurchaseUser: string | null;
}
