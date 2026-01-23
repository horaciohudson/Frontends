export interface Color {
  id: string;
  colorName: string;
  name?: string; // Alias for compatibility
  hexCode?: string;
  active?: boolean;
  displayOrder?: number;
  sizeId?: string | null;
  sizeName?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}