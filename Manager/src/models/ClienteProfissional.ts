import { Cliente } from "./Cliente";

export interface ClienteProfissional {
  id: number;
  cliente: Cliente;
  foneEmpresa: string;
  admissao: string;
  cepEmpresa: string;
  cidadeEmpresa: string;
  ufEmpresa: string;
  funcao: string;
  empresaAnterior: string;
  tempoServico: string;

}
   
