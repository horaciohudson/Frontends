import { Customer } from "./Customer";

export interface CustomerPhoto {
  id?: number;
  customer?: Customer;
  photo: string;
  photoBase64?: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;

}
