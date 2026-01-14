import { Customer } from "./Customer";

export interface CustomerPhysical {
  id: string;
  customer: Customer;
  nationalIdNumber: string;
  identityDocument: string;
  fatherName: string;
  motherName: string;
}

