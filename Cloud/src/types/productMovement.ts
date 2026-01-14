export enum MovementType {
    ENTRY = 'ENTRY',
    EXIT = 'EXIT',
    SALE = 'SALE',
    RETURN = 'RETURN',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    ADJUSTMENT = 'ADJUSTMENT'
}

export interface ProductMovement {
    id: number;
    productId: number;
    productName: string;
    variantId?: number;
    variantSku?: string;
    sizeName?: string;
    colorName?: string;
    movementType: MovementType;
    quantity: number;
    unitPrice?: number;
    totalValue?: number;
    reason?: string;
    notes?: string;
    movementDate: string;
    createdBy?: number;
    createdByName?: string;
    createdAt?: string;
}

export interface ProductMovementRequest {
    movementType: MovementType;
    productId?: number;
    variantId?: number;
    quantity: number;
    unitPrice?: number;
    reason?: string;
    notes?: string;
    movementDate?: string;
}

export interface StockEntryItem {
    productId: number;
    productName?: string;
    variantId?: number;
    sizeName?: string;
    colorName?: string;
    quantity: number;
    unitCost: number;
    totalCost?: number;
}
