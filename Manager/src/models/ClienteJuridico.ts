import { Cliente } from "./Cliente";

export interface ClienteJuridico {
  id: number;
  cliente: Cliente;
  cnpj: string;
  inscricao: string;
  icmsIpi?: number;
  faturamento?: number;
  atividadeId?: Atividade;
}

export interface Atividade {
  id: number;
  nome: string;
}
