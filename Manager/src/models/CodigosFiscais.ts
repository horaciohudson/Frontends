

export interface CodigosFiscais {
  idCodFiscOpr?: number; // ← agora é opcional
  cfop: string;
  nome: string;
  controle?: string;
  calcIcms?: string;
  foraEstab?: string;
  calcFunrural?: string;
  calcIpi?: string;
  calcSicm?: string;
  dataCriacao?: string;
  dataAlteracao?: string | null;
}
