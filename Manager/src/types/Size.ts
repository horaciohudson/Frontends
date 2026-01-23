export interface Size {
  id: string;
  sizeName: string;
  name?: string; // Alias for compatibility
  description?: string;
  active?: boolean;
  displayOrder?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}