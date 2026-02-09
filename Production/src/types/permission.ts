export interface Permission {
    id: number;
    permissionKey: string;
    description?: string;
    level?: number;
    module?: string;
    name?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserPermission {
    id?: number;
    userId: string;
    permissionId: number;
    tenantId: string;
    granted: boolean;
    notes?: string;
    grantedAt?: Date;
    grantedBy?: string;
    revokedAt?: Date;
    revokedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PermissionModule {
    id: string;
    name: string;
    icon: string;
    permissions: Permission[];
}
