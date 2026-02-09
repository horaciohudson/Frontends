export const QualityStatus = {
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    REWORK: 'REWORK'
} as const;

export type QualityStatus = typeof QualityStatus[keyof typeof QualityStatus];

export interface ProductionExecution {
    id: string;
    tenantId: string;
    companyId: string;
    productionOrderId: string;
    stepId: string;
    startTime: string;
    endTime?: string;
    quantityDone: number;
    lossQuantity: number;
    employeeId?: string;
    machineId?: string;
    qualityStatus?: QualityStatus;
    rejectionReason?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface CreateProductionExecutionRequest {
    companyId: string;
    productionOrderId: string;
    stepId: string;
    startTime: string;
    endTime?: string;
    quantityDone: number;
    lossQuantity?: number;
    employeeId?: string;
    machineId?: string;
    qualityStatus?: QualityStatus;
    rejectionReason?: string;
    notes?: string;
}

export interface UpdateProductionExecutionRequest {
    stepId?: string;
    startTime?: string;
    endTime?: string;
    quantityDone?: number;
    lossQuantity?: number;
    employeeId?: string;
    machineId?: string;
    qualityStatus?: QualityStatus;
    rejectionReason?: string;
    notes?: string;
}
