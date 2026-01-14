export interface ProductSizeColor {
  id: number | null;
  productId: number;
  sizeId: number;
  colorId: number;
  stock: number;
  salePrice: number;
  costPrice: number;
  minimumStock: number;
  active: boolean;
  
  // Campos relacionados (para exibição)
  productName?: string;
  sizeName?: string;
  colorName?: string;
}

export interface ProductSizeColorStats {
  totalItems: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}