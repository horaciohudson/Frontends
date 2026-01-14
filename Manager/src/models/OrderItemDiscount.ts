// src/models/OrderItemDiscount.ts
import { UUID, Big } from "../types/common";

export interface OrderItemDiscountDTO {
  orderItemId: UUID;       // MapsId
  discountPercent?: Big;
  discountValue?: Big;
}
