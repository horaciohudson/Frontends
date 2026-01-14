export interface Color {
  id: string | null; // Mudou para string (UUID)
  name: string; // Agora mapeado corretamente pelo DTO
  hexCode?: string;
  active?: boolean;
  displayOrder?: number;
  sizeId?: string | null; // Mudou para string (UUID) - null = cor global
  sizeName?: string; // para exibição
  createdAt?: string | null;
  updatedAt?: string | null;
}