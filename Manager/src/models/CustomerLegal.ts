// models/CustomerLegal.ts
import { Customer } from "./Customer";

export interface CustomerLegal {
  id: string; // UUID no backend, não number
  customer: Customer; // objeto completo se precisar
  customerId: string; // id puro
  cnpj: string;
  registration: string; // estava "inscricao"  
  icmsIpi?: number;
  revenue?: number;
  activityId?: number;

}