import { TipoEmbalagem } from "./TipoEmbalagem";

export interface Produto {
  id?: number | null; // Mapeia idProduto do backend
  nome: string;
  idProdutoCategoria: number;
  nomeProdutoCategoria?: string;
  idProdutoSubCategoria: number;
  nomeProdutoSubCategoria?: string;
  idProdutoTamanho?: number;
  nomeProdutoTamanho?: string;
  idFornecedor?: number;
  nomeFornecedor?: string;
  mesesGarantia?: number;
  embalagem?: TipoEmbalagem;
  referencia?: string;
  referenciaTecnica?: string; 
  
}
