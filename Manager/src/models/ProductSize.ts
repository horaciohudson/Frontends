export interface ProductSize {
  id: number | null;
  size: string;
  productId?: number;
  productSubcategoryId?: number;
  stock: number;
}
