export interface ServiceDTO {
    id: string;
    tenantId: string;
    companyId: string;
    code: string;
    name: string;
    description?: string;
    unitPrice?: number;
    costCenterId?: string;
    isActive: boolean;
    notes?: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface CreateServiceDTO {
    tenantId: string;
    companyId: string;
    code: string;
    name: string;
    description?: string;
    unitPrice?: number;
    costCenterId?: string;
    isActive?: boolean;
    notes?: string;
}

export interface UpdateServiceDTO {
    code?: string;
    name?: string;
    description?: string;
    unitPrice?: number;
    costCenterId?: string;
    isActive?: boolean;
    notes?: string;
}

export interface ServiceFilters {
    companyId?: string;
    activeOnly?: boolean;
    searchText?: string;
}