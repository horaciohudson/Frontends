
import { Customer } from "./Customer";

export interface CustomerProfessional {
  id: string;                 // UUID in backend
  customer: Customer;
  company: string;            // empresa
  position: string;           // cargo
  companyPhone: string;       // telefoneEmpresa
  admissionDate: string;      // dataAdmissao (ISO date string)
  companyPostalCode: string;  // cepEmpresa
  companyCity: string;        // cidadeEmpresa
  companyState: string;       // estadoEmpresa
  previousCompany: string;    // empresaAnterior
  serviceTime: string;        // tempoServico
  observations: string;       // observacoes
}
