// Types for Gateway API

export interface AuthRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token?: string;
    username?: string;
    roles?: string[];
    message: string;
}

export interface ModuleStatus {
    name: string;
    url: string;
    online: boolean;
    version: string;
    responseTimeMs: number;
    lastCheck: string;
}

export interface SystemHealthResponse {
    status: string;
    totalModules: number;
    onlineModules: number;
    modules: ModuleStatus[];
    timestamp: string;
}

export interface LaunchRequest {
    module: string;
    action: 'START' | 'STOP' | 'RESTART';
}

export interface LaunchResponse {
    module: string;
    action: string;
    success: boolean;
    message: string;
    timestamp: string;
}

export interface ExportRequest {
    module: string;
    entity: string;
    format: 'CSV' | 'EXCEL' | 'JSON';
    fields?: string[];
}

export interface ImportResult {
    success: boolean;
    message: string;
    recordsProcessed: number;
    recordsSuccess: number;
    recordsFailed: number;
    errors?: string[];
}

export interface User {
    username: string;
    roles: string[];
}
