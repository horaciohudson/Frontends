export interface Transportador {
  idTransportador?: number;
  empresaId: number;
  nomeFantasia: string;
  diasPrazoEntrega: number;
  formaPagamento: number;    
  tipoTransporte: string;      
  ativo : boolean ;
  observacoes: string
}
