// Tipo de Unidade de Medida
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

// DTO de Produto de Produção
export interface ProductionProductDTO {
    id: string;
    tenantId: string;
    companyId: string;
    productId?: string;
    sku?: string;
    barcode?: string;
    description: string;
    size?: string;
    color?: string;
    unitType: UnitType;
    imageUrl?: string;
    notes?: string;
    isActive: boolean;
    version: number;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
}

// DTO para criação
export interface CreateProductionProductDTO {
    tenantId: string;
    companyId: string;
    productId?: string;
    sku?: string;
    barcode?: string;
    description: string;
    size?: string;
    color?: string;
    unitType: UnitType;
    imageUrl?: string;
    notes?: string;
    isActive?: boolean;
}

// DTO para atualização
export interface UpdateProductionProductDTO {
    productId?: string;
    sku?: string;
    barcode?: string;
    description?: string;
    size?: string;
    color?: string;
    unitType?: UnitType;
    imageUrl?: string;
    notes?: string;
    isActive?: boolean;
}
