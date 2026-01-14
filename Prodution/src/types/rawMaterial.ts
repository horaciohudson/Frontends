// Tipo de Unidade de Medida (mesmo do ProductionProduct)
export type UnitType = 'UN' | 'KG' | 'G' | 'M' | 'M2' | 'M3' | 'L' | 'ML' | 'PC' | 'CX' | 'FD' | 'RL' | 'HR';

export const UnitType = {
    UN: 'UN' as const,
    KG: 'KG' as const,
    G: 'G' as const,
    M: 'M' as const,
    M2: 'M2' as const,
    M3: 'M3' as const,
    L: 'L' as const,
    ML: 'ML' as const,
    PC: 'PC' as const,
    CX: 'CX' as const,
    FD: 'FD' as const,
    RL: 'RL' as const,
    HR: 'HR' as const
};

export const UnitTypeLabels: Record<UnitType, string> = {
    UN: 'Unidade',
    KG: 'Quilograma',
    G: 'Grama',
    M: 'Metro',
    M2: 'Metro Quadrado',
    M3: 'Metro Cúbico',
    L: 'Litro',
    ML: 'Mililitro',
    PC: 'Peça',
    CX: 'Caixa',
    FD: 'Fardo',
    RL: 'Rolo',
    HR: 'Hora'
};

// DTO de Matéria Prima
export interface RawMaterialDTO {
    id: string;
    tenantId: string;
    companyId: string;
    
    // Identificação
    code: string;
    name: string;
    unitType: UnitType;
    
    // Fornecedor
    supplierId?: string;
    
    // Custos
    averageCost?: number;
    lastPurchasePrice?: number;
    lastPurchaseDate?: string;
    
    // Controle de estoque
    stockControl: boolean;
    minStock?: number;
    maxStock?: number;
    reorderPoint?: number;
    leadTimeDays?: number;
    
    // Categoria
    categoryId?: string;
    
    // Controle
    isActive: boolean;
    
    // Auditoria
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    version: number;
}

// DTO para criação
export interface CreateRawMaterialDTO {
    tenantId: string;
    companyId: string;
    
    code: string;
    name: string;
    unitType: UnitType;
    
    supplierId?: string;
    
    averageCost?: number;
    lastPurchasePrice?: number;
    
    stockControl?: boolean;
    minStock?: number;
    maxStock?: number;
    reorderPoint?: number;
    leadTimeDays?: number;
    
    categoryId?: string;
    
    isActive?: boolean;
}

// DTO para atualização
export interface UpdateRawMaterialDTO {
    code?: string;
    name?: string;
    unitType?: UnitType;
    
    supplierId?: string;
    
    averageCost?: number;
    lastPurchasePrice?: number;
    
    stockControl?: boolean;
    minStock?: number;
    maxStock?: number;
    reorderPoint?: number;
    leadTimeDays?: number;
    
    categoryId?: string;
    
    isActive?: boolean;
}