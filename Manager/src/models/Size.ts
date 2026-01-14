export interface Size {
  id: string | null; // Mudou para string (UUID)
  sizeName: string; // Backend field: size_name
  name?: string; // Alias for compatibility
  description?: string;
  active?: boolean;
  displayOrder?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}