export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export const UserStatus = {
    ACTIVE: 'ACTIVE' as UserStatus,
    INACTIVE: 'INACTIVE' as UserStatus,
    BLOCKED: 'BLOCKED' as UserStatus
};

export interface Role {
    id: number;
    role: string;
    description: string;
}

export interface User {
    id: string;
    tenantId: string;
    username: string;
    email?: string;
    fullName: string;
    status: UserStatus;
    failedAttempts?: number;
    lockedUntil?: string;
    lastLoginAt?: string;
    language?: string;
    timezone?: string;
    systemAdmin: boolean;
    roles?: string[];
    roleIds?: number[];
}

export interface CreateUserRequest {
    tenantId: string;
    username: string;
    email?: string;
    password: string;
    fullName: string;
    status?: UserStatus;
    language?: string;
    timezone?: string;
    systemAdmin?: boolean;
    roleIds?: number[];
}

export interface UpdateUserRequest {
    username: string;
    email?: string;
    password?: string;
    fullName: string;
    status?: UserStatus;
    language?: string;
    timezone?: string;
    systemAdmin?: boolean;
    roleIds?: number[];
}
