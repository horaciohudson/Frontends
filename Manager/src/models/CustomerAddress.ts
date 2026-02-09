export interface CustomerAddress {
  id: string; // UUID
  companyId?: string; // UUID
  addressType: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}
