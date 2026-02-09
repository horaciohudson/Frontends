export const ProductionOrderStatus = {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    FINISHED: 'FINISHED',
    CANCELED: 'CANCELED'
} as const;

export type ProductionOrderStatusType = typeof ProductionOrderStatus[keyof typeof ProductionOrderStatus];

export const PriorityLevel = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
} as const;

export type PriorityLevelType = typeof PriorityLevel[keyof typeof PriorityLevel];

export interface ProductionOrder {
    id: string;
    tenantId: string;
    companyId: string;
    code: string;
    productId: string;
    productName?: string;
    quantityPlanned: number;
    quantityProduced: number;
    status: ProductionOrderStatusType;
    priority: PriorityLevelType;
    startDate?: string;
    endDate?: string;
    deadline?: string;
    customerId?: string;
    orderId?: string;
    costTotal: number;
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
    version: number;
    approvedBy?: string;
    approvedAt?: string;
    finishedBy?: string;
    finishedAt?: string;
    canceledReason?: string;
}

export interface CreateProductionOrderRequest {
    tenantId: string;
    companyId: string;
    code: string;
    productId: string;
    quantityPlanned: number;
    priority: PriorityLevelType;
    startDate?: string;
    deadline?: string;
    customerId?: string;
    orderId?: string;
    notes?: string;
}

export interface UpdateProductionOrderRequest {
    code?: string;
    productId?: string;
    quantityPlanned?: number;
    quantityProduced?: number;
    priority?: PriorityLevelType;
    startDate?: string;
    endDate?: string;
    deadline?: string;
    customerId?: string;
    orderId?: string;
    costTotal?: number;
    notes?: string;
}
