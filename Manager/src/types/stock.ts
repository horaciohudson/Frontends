export interface ProductSizeColorDTO {
  id?: number;
  productId?: number;
  productName?: string;
  productCode?: string;
  sizeId?: number;
  sizeName?: string;
  colorId?: number;
  colorName?: string;
  stock?: number;
  salePrice?: number;
  costPrice?: number;
  minimumStock?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Campos calculados
  stockValue?: number;
  stockStatus?: 'LOW' | 'NORMAL' | 'HIGH';
  hasMovements?: boolean;
  
  // Para edição em lote
  selected?: boolean;
  modified?: boolean;
  originalStock?: number;
  stockDifference?: number;
}

export interface StockEntryRequestDTO {
  productId: number;
  reason?: string;
  notes?: string;
  items: StockEntryItemDTO[];
}

export interface StockEntryItemDTO {
  productSizeColorId?: number;
  sizeId: number;
  colorId: number;
  quantity: number;
  salePrice: number;
  costPrice: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface StockStatistics {
  totalItems: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export interface StockFilters {
  productId?: number;
  sizeId?: number;
  colorId?: number;
  minStock?: number;
  maxStock?: number;
  searchTerm?: string;
  stockStatus?: 'LOW' | 'NORMAL' | 'HIGH';
  withoutMovementDays?: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  movementType: 'ENTRY' | 'EXIT' | 'SALE' | 'RETURN' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reason: string;
  notes?: string;
  movementDate: string;
  createdAt: string;
}

export interface StockConsultationItem {
  productId: number;
  productName: string;
  productCode: string;
  categoryName: string;
  totalStock: number;
  totalValue: number;
  minimumStock: number;
  averageCost: number;
  lastMovementDate?: string;
  stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
  variations: ProductSizeColorDTO[];
}

// Tipos básicos para Product, Size e Color
export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  active: boolean;
}

export interface Size {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  displayOrder: number;
}

export interface Color {
  id: number;
  name: string;
  hexCode?: string;
  active: boolean;
  displayOrder: number;
}