export interface TenantDTO {
    id: string;
    code: string;
    name: string;
    status: TenantStatus;
    createdAt: string;
    updatedAt?: string;
    createdBy: string;
    updatedBy?: string;
}

export interface CreateTenantDTO {
    code: string;
    name: string;
    status?: TenantStatus;
}

export interface UpdateTenantDTO {
    name: string;
    status?: TenantStatus;
}

export enum TenantStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export const TenantStatusLabels: Record<TenantStatus, string> = {
    [TenantStatus.ACTIVE]: 'Ativo',
    [TenantStatus.INACTIVE]: 'Inativo'
};
