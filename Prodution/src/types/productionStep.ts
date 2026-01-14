export interface ProductionStepDTO {
    id: string;
    tenantId: string;
    companyId: string;
    name: string;
    description?: string;
    sequence: number;
    estimatedTime: number;
    costCenterId?: string;
    isOutsourced: boolean;
    requiresApproval: boolean;
    isActive: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface CreateProductionStepDTO {
    tenantId: string;
    companyId: string;
    name: string;
    description?: string;
    sequence?: number;
    estimatedTime?: number;
    costCenterId?: string;
    isOutsourced?: boolean;
    requiresApproval?: boolean;
    isActive?: boolean;
}

export interface UpdateProductionStepDTO {
    name?: string;
    description?: string;
    sequence?: number;
    estimatedTime?: number;
    costCenterId?: string;
    isOutsourced?: boolean;
    requiresApproval?: boolean;
    isActive?: boolean;
}

export interface ProductionStepFilters {
    companyId?: string;
    activeOnly?: boolean;
    searchText?: string;
}
