
export interface Composicao {
  id: number | null;
  nome: string;
  custoTotal: number | null; // Allow null to match backend
  ativo: boolean;
}
