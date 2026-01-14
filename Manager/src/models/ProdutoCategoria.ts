import { ProdutoSubCategoria } from "./ProdutoSubCategoria";

export interface ProdutoCategoria {
  id: number;
  nome: string;
  dataCriacao?: string;
  dataAlteracao?: string;
  subcategorias?: ProdutoSubCategoria[];
}

