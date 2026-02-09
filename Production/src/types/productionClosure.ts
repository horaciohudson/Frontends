export interface ProductionClosure {
    id: string;
    tenantId: string;
    companyId: string;
    productionOrderId: string;
    totalMaterial: number;
    totalService: number;
    totalLabor: number;
    totalIndirect: number;
    totalCost: number;
    closureDate: string;
    closedAt?: string;
    closedBy?: string;
    exportedToFinancial?: boolean;
    financialExportDate?: string;
    financialDocumentId?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: string;
}

export interface CreateProductionClosureRequest {
    companyId: string;
    productionOrderId: string;
    totalCost: number;
    totalMaterial?: number;
    totalService?: number;
    totalLabor?: number;
    totalIndirect?: number;
    closureDate?: string;
    notes?: string;
}

export interface UpdateProductionClosureRequest {
    totalCost?: number;
    totalMaterial?: number;
    totalService?: number;
    totalLabor?: number;
    totalIndirect?: number;
    closureDate?: string;
    notes?: string;
}