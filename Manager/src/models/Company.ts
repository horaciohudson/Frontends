// models/Company.ts
export interface Company {
  id: string | null; // UUID from backend
  corporateName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  phone: string;
  mobile: string;
  email: string;
  whatsapp: string;
  issRate: number;
  funruralRate: number;
  manager: string;
  factory: boolean;
  currencyId: number | null;
  activityId: number | null;
  supplierFlag: boolean;
  customerFlag: boolean;
  transporterFlag: boolean;
  version?: number; // Campo para controle de concorrência otimista
}
