export interface MateriaPrimaMedida {
  id?: number | null;
  idMateriaPrima: number;
  pesoBruto?: number | null;
  pesoLiquido?: number | null;
  comprimento?: number | null;
  largura?: number | null;
  unidadeMedida?: string;
  caixaPecas?: number | null;
}
