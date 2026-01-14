export interface RawMaterialStock {
    id: string;
    tenantId: string;
    companyId: string;
    rawMaterialId: string;
    warehouseId?: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lastMovementDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RawMaterialMovement {
    id: string;
    tenantId: string;
    companyId: string;
    rawMaterialId: string;
    movementType: StockMovementType;
    movementOrigin: MovementOrigin;
    originId?: string;
    documentNumber?: string;
    movementDate: string;
    quantity: number;
    unitCost?: number;
    totalCost?: number;
    userId?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: string;
}

export interface CreateRawMaterialMovementRequest {
    companyId: string;
    rawMaterialId: string;
    movementType: StockMovementType;
    movementOrigin: MovementOrigin;
    originId?: string;
    documentNumber?: string;
    movementDate?: string;
    quantity: number;
    unitCost?: number;
    totalCost?: number;
    userId?: string;
    notes?: string;
}

export type StockMovementType = 'IN' | 'OUT';

export type MovementOrigin = 'PURCHASE' | 'PRODUCTION' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';

export const StockMovementTypeLabels: Record<StockMovementType, string> = {
    'IN': 'Entrada',
    'OUT': 'Saída'
};

export const MovementOriginLabels: Record<MovementOrigin, string> = {
    'PURCHASE': 'Compra',
    'PRODUCTION': 'Produção',
    'ADJUSTMENT': 'Ajuste',
    'RETURN': 'Devolução',
    'TRANSFER': 'Transferência'
};