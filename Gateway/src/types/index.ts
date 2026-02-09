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

// Enhanced error handling types for DataSync component
export enum ExportErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR', 
    DATA_ERROR = 'DATA_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export interface ExportError {
    type: ExportErrorType;
    code: string;
    message: string;
    details?: string;
    retryable: boolean;
    module?: string;
    entity?: string;
    timestamp?: string;
}

export interface ExportState {
    loading: boolean;
    error: ExportError | null;
    success: boolean;
    progress?: number;
    cancellable?: boolean;
    retryCount?: number;
}

export interface User {
    username: string;
    roles: string[];
}
