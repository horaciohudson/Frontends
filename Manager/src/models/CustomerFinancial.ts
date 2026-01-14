import { Customer } from "./Customer";

export interface CustomerFinancial {
  id: number;
  customer: Customer;
  creditLimit: number | null;
  debtBalance: number | null;
  paymentMethod: string;
  paymentMethodId?: number | null;
}

