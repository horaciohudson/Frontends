// src/models/OrderItem.ts
import { UUID, Big } from "../types/common";
import { UnitType } from "../enums/UnitType";

export interface OrderItemDTO {
  id?: UUID;
  orderId: UUID;
  itemSeq: number;

  productId?: string;       // UUID do produto
  productName?: string;     // Nome do produto retornado pelo backend
  serviceId?: string;       // UUID do serviço 
  serviceName?: string;     // Nome do serviço retornado pelo backend
  description?: string;

  quantity?: Big;
  unitPrice?: Big;
  totalValue?: Big;

  unitType?: UnitType;
  size?: string;
  weight?: Big;
}
