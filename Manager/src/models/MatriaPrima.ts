 
import { TipoEmbalagem } from "./TipoEmbalagem";    
export interface MateriaPrima {
  idMateriaPrima?: number | null; 
  nomeMateriaPrima?: string;
  nome: string;
  idProdutoCategoria: number;
  nomeProdutoCategoria?: string;
  idFornecedor?: number;
  nomeFornecedor?: string;
  mesesGarantia?: number | null;
  embalagem?: TipoEmbalagem;
  referencia?: string | null;
  localizacao?: string | null;
}
