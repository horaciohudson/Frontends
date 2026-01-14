export interface PlanoConta {
  id: number;
  codigo: string;
  nome: string;
  tipoConta: "ATIVO" | "PASSIVO" | "RECEITA" | "DESPESA" | "PATRIMONIO_LIQUIDO";
  natureza: "CREDITO" | "DEBITO";
  nivel: number;
  contaPai?: PlanoConta | null;
  aceitaLancamento: boolean;
  ativo: boolean;
  dataCriacao?: string;
  dataAlteracao?: string | null;
}
