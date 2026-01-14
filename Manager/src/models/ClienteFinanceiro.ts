import { Cliente } from "./Cliente";
import { FormaPagamento } from "./FormaPagamento";

export interface ClienteFinanceiro {
  id: number;
  cliente: any; // ou Cliente se tipado
  limiteCredito: number | null;
  saldoDevedor: number | null;
  formaPagamentoId: number | FormaPagamento | null; // para editar
  formaPagamentoNome?: string; // <- para exibir na grade
}

