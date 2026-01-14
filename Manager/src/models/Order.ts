// src/models/Order.ts
import { UUID } from "../types/common";
import { OrderStatus, OrderType, AddressType, NoteType, UnitType } from "../enums";

export interface OrderDTO {
  id?: UUID;
  customerId?: UUID;
  salesPersonId?: number;
  paymentMethodId?: number;
  companyId?: UUID;
  status?: OrderStatus;
  orderType?: OrderType;
  moved?: boolean;
  movementDate?: string;
  totalProducts?: number;
  totalServices?: number;
  totalOrder?: number;
}

export interface OrderItemDTO {
  id?: UUID;
  orderId: UUID;
  itemSeq: number;
  productId?: UUID;       // UUID do produto
  productName?: string;   // Nome do produto retornado pelo backend
  serviceId?: UUID;       // UUID do serviço (se for item de serviço)
  serviceName?: string;   // Nome do serviço retornado pelo backend
  isProduct?: boolean;    // true = Produto, false = Serviço
  description?: string;
  quantity?: number;
  unitPrice?: number;
  unitType?: UnitType;
  size?: string;
  colorId?: string;     // UUID da cor selecionada
  colorName?: string;   // Nome da cor para exibição
  weight?: number;
  discountPercentage?: number;
  totalValue?: number;
  itemObservation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderAddressDTO {
  id?: UUID;
  orderId: UUID;
  addressType?: AddressType;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderContextDTO {
  orderId: UUID; // Chave primária no backend
  noteType?: NoteType;
  fiscalObservation?: string; // Campo correto do backend
  invoiceNumber?: string;
  invoiceSeries?: string;
  cfopId?: number; // Campo que o backend retorna
  fiscalOperationCodeId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderFinancialDTO {
  orderId: UUID; // Chave primária no backend (MapsId)
  freightValue?: number; // Valor do frete
  discountPercentage?: number; // Percentual de desconto
  discountValue?: number; // Valor do desconto
  createdAt?: string;
  updatedAt?: string;
}

// Enums are imported from ../enums
