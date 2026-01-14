import { UUID, Big } from "../types/common";

export interface OrderFinancialDTO {
  orderId: UUID;           // MapsId
  freightValue?: Big;
  discountValue?: Big;
  discountPercent?: Big;
  additionValue?: Big;
  additionPercent?: Big;
}
