import api from './api';
import { ExportRequest, ImportResult, ExportError, ExportErrorType } from '../types';
import { AxiosError } from 'axios';

// Global abort controller for cancellation support
let currentExportController: AbortController | null = null;

export const dataSyncService = {
    async exportData(request: ExportRequest, onProgress?: (progress: number) => void): Promise<Blob> {
        try {
            // Create new abort controller for this request
            currentExportController = new AbortController();
            
            const response = await api.post('/data/export', request, {
                responseType: 'blob',
                signal: currentExportController.signal,
                onDownloadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
                timeout: 300000, // 5 minutes timeout
            });
            
            // Clear controller on success
            currentExportController = null;
            return response.data;
        } catch (error) {
            // Clear controller on error
            currentExportController = null;
            
            // Handle cancellation
            if ((error as any).name === 'CanceledError') {
                throw new Error('EXPORT_CANCELLED');
            }
            
            // Parse structured error from response headers
            throw this.parseExportError(error as AxiosError, request);
        }
    },

    cancelExport(): void {
        if (currentExportController) {
            currentExportController.abort();
            currentExportController = null;
        }
    },

    isExportCancellable(): boolean {
        return currentExportController !== null;
    },

    async importData(
        module: string,
        entity: string,
        file: File
    ): Promise<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ImportResult>(
            `/data/import/${module}/${entity}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    async syncData(request: any): Promise<any> {
        const response = await api.post('/data/sync', request);
        return response.data;
    },

    /**
     * Parses structured error information from axios error response headers
     * Maps backend error codes to frontend error types for better UX
     */
    parseExportError(error: AxiosError, request: ExportRequest): ExportError {
        const headers = error.response?.headers;
        const status = error.response?.status;

        // Handle cancellation
        if (error.message === 'EXPORT_CANCELLED') {
            return {
                type: ExportErrorType.NETWORK_ERROR,
                code: 'EXPORT_CANCELLED',
                message: 'Exportação cancelada pelo usuário.',
                retryable: true,
                module: request.module,
                entity: request.entity,
                timestamp: new Date().toISOString()
            };
        }

        // Extract structured error information from headers
        const errorCode = headers?.['x-error-code'] || 'UNKNOWN';
        const errorMessage = headers?.['x-error-message'] || error.message;
        const errorDetails = headers?.['x-error-details'];
        const errorType = headers?.['x-error-type'];

        // Map backend error types to frontend error types
        let mappedType: ExportErrorType;
        let retryable = false;

        if (errorType) {
            switch (errorType) {
                case 'AUTHENTICATION_ERROR':
                    mappedType = ExportErrorType.AUTHENTICATION_ERROR;
                    break;
                case 'VALIDATION_ERROR':
                    mappedType = ExportErrorType.VALIDATION_ERROR;
                    break;
                case 'CONFIGURATION_ERROR':
                    mappedType = ExportErrorType.CONFIGURATION_ERROR;
                    break;
                case 'INTERNAL_ERROR':
                    mappedType = ExportErrorType.SERVER_ERROR;
                    retryable = true;
                    break;
                default:
                    mappedType = ExportErrorType.SERVER_ERROR;
                    retryable = true;
            }
        } else {
            // Fallback to status code mapping if no error type header
            if (!status) {
                mappedType = ExportErrorType.NETWORK_ERROR;
                retryable = true;
            } else if (status >= 400 && status < 500) {
                if (status === 401 || status === 403) {
                    mappedType = ExportErrorType.AUTHENTICATION_ERROR;
                } else if (status === 408) {
                    mappedType = ExportErrorType.TIMEOUT_ERROR;
                    retryable = true;
                } else {
                    mappedType = ExportErrorType.VALIDATION_ERROR;
                }
            } else if (status >= 500) {
                mappedType = ExportErrorType.SERVER_ERROR;
                retryable = true;
            } else {
                mappedType = ExportErrorType.SERVER_ERROR;
                retryable = true;
            }
        }

        // Determine if error is retryable based on error code patterns
        if (errorCode.includes('TIMEOUT') || errorCode.includes('CONNECTION') || 
            errorCode.includes('UNAVAILABLE') || errorCode.includes('LIMIT') ||
            errorCode.includes('NETWORK') || errorCode.includes('CANCELLED')) {
            retryable = true;
        }

        return {
            type: mappedType,
            code: errorCode,
            message: this.getUserFriendlyMessage(mappedType, errorMessage),
            details: errorDetails,
            retryable,
            module: request.module,
            entity: request.entity,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Provides user-friendly error messages based on error type
     */
    getUserFriendlyMessage(type: ExportErrorType, originalMessage: string): string {
        switch (type) {
            case ExportErrorType.NETWORK_ERROR:
                return 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
            case ExportErrorType.AUTHENTICATION_ERROR:
                return 'Erro de autenticação. Faça login novamente.';
            case ExportErrorType.TIMEOUT_ERROR:
                return 'A operação demorou muito para ser concluída. Tente novamente.';
            case ExportErrorType.VALIDATION_ERROR:
                return `Dados inválidos: ${originalMessage}`;
            case ExportErrorType.CONFIGURATION_ERROR:
                return 'Erro de configuração do sistema. Contate o administrador.';
            case ExportErrorType.DATA_ERROR:
                return 'Erro ao processar os dados. Verifique os dados solicitados.';
            case ExportErrorType.SERVER_ERROR:
                return 'Erro interno do servidor. Tente novamente em alguns minutos.';
            default:
                return originalMessage || 'Erro desconhecido ocorreu.';
        }
    }
};
