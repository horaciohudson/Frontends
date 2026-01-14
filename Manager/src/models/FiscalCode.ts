export interface FiscalCode {
  id?: number; // Optional id (was idCodFiscOpr)
  cfop: string;
  name: string;
  control?: string;
  icmsCalc?: string;
  outOfEstablishment?: string; // was foraEstab
  funruralCalc?: string;
  ipiCalc?: string;
  sicmCalc?: string;
  createdAt?: string;
  updatedAt?: string | null; // was dataAlteracao
}
