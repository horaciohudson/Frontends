// src/models/OrderAddress.ts
import { UUID } from "../types/common";
import { AddressType } from "../enums/AddressType";

export interface OrderAddressDTO {
  orderId: UUID;           // MapsId
  addressType: AddressType;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}
