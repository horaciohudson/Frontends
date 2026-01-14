export type AddressType = "RESIDENTIAL" | "BUSINESS" | "OTHER"; // ajuste conforme seu enum

export interface SalesPersonAddress {
  id: number;
  salespersonId: number;
  companyAddressId: number;
  addressType: AddressType;
  phone: string;
  fax: string;
}
