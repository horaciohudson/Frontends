import { Cliente } from "./Cliente";

export interface ClienteFisico {
  id: number;
  cliente: Cliente;
  cpf: string;
  rg: string;
  pai: string;
  mae: string;
}
