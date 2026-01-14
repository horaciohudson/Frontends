import { Cliente } from "./Cliente";

export interface FotoCliente {
  id: number;
  cliente: Cliente;
  foto: string; // base64 ou URL
}
