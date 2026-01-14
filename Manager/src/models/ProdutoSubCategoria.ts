import { ProdutoCategoria } from "./ProdutoCategoria";

export interface ProdutoSubCategoria {
  id: number | null;
  item: number;
  nome: string;
  dataCriacao?: string;
  dataAlteracao?: string;
  produtoCategoria?: ProdutoCategoria;
}
