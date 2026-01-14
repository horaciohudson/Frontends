// src/models/OrderItemCommission.ts
import { UUID, Big } from "../types/common";

export interface OrderItemCommissionDTO {
  orderItemId: UUID;       // MapsId
  salespersonCommission?: Big;
  brokerCommission?: Big;
}
