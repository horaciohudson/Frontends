export interface Stock {
    id: number;
    productId: number;
    productName?: string;
    productSku?: string;
    warehouseLocation?: string;
    quantity: number;
    reservedQuantity?: number;
    availableQuantity?: number;
    lowStockThreshold: number;
    isLowStock?: boolean;
    lastRestockDate?: string;
    createdAt?: string;
    updatedAt?: string;
    // Campos legados para compatibilidade
    minQuantity?: number;
    maxQuantity?: number;
    location?: string;
    lastUpdated?: string;
    status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StockFormData {
    productId: number;
    quantity: number;
    minQuantity: number;
    maxQuantity?: number;
    location?: string;
}

export interface StockMovement {
    id: number;
    stockId: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason?: string;
    createdAt: string;
    createdBy?: string;
}
