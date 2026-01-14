import { Cliente } from "./Cliente";

export interface ClienteEndereco {
  id: number;
  cliente: Cliente;
  tipoClienteEndereco: "COMERCIAL" | "RESIDENCIAL" | "COBRANCA";
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}
