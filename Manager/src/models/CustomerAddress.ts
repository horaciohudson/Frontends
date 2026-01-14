import { Customer } from "./Customer";

export interface CustomerAddress {
  id: number;
  customer: Customer;
  addressType: "COMMERCIAL" | "RESIDENTIAL" | "BILLING";
  street: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}
