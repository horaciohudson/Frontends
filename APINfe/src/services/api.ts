import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Token management utilities
const TokenManager = {
    getToken(): string | null {
        return localStorage.getItem('token');
    },

    setToken(token: string): void {
        localStorage.setItem('token', token);
    },

    clearToken(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isTokenExpired(token: string): boolean {
        try {
            // Check if token has the basic JWT structure (3 parts separated by dots)
            const parts = token.split('.');
            if (parts.length !== 3) {
                return true; // Invalid JWT structure
            }

            // Try to decode the payload (second part)
            const payload = JSON.parse(atob(parts[1]));
            
            // Check if payload has expiration field
            if (!payload.exp || typeof payload.exp !== 'number') {
                return true; // No expiration or invalid expiration
            }

            const now = Math.floor(Date.now() / 1000);
            return payload.exp < now;
        } catch (error) {
            // Any error in parsing means the token is invalid/expired
            console.error('Error parsing token:', error);
            return true; // Consider invalid tokens as expired
        }
    },

    isAuthenticated(): boolean {
        const token = this.getToken();
        return token !== null && !this.isTokenExpired(token);
    }
};

// Request interceptor to automatically include Authorization headers
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = TokenManager.getToken();

        if (token) {
            // Check if token is expired before sending request
            if (TokenManager.isTokenExpired(token)) {
                console.warn('Token expired, clearing and redirecting to login');
                TokenManager.clearToken();
                window.location.href = '/login';
                return Promise.reject(new Error('Token expired'));
            }

            // Add Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Enhanced error handling utility
const ErrorHandler = {
    /**
     * Extracts meaningful error messages from various response formats
     * Prevents "undefined" error messages by providing fallbacks
     */
    extractErrorMessage(error: AxiosError, fallbackMessage: string): string {
        const errorData = error.response?.data as any;
        
        // Try multiple possible error message fields
        const possibleMessages = [
            errorData?.message,
            errorData?.error,
            errorData?.details,
            errorData?.errorMessage,
            errorData?.description,
            error.response?.statusText,
            error.message
        ];

        // Find the first non-empty, non-undefined message
        for (const msg of possibleMessages) {
            if (msg && typeof msg === 'string' && msg.trim() !== '' && msg !== 'undefined') {
                return msg.trim();
            }
        }

        return fallbackMessage;
    },

    /**
     * Determines error type based on error properties
     */
    getErrorType(error: AxiosError): 'network' | 'auth' | 'server' | 'client' | 'timeout' {
        if (!error.response) {
            // No response received - likely network error
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                return 'timeout';
            }
            return 'network';
        }

        const status = error.response.status;
        
        if (status === 401 || status === 403) {
            return 'auth';
        } else if (status >= 500) {
            return 'server';
        } else if (status >= 400) {
            return 'client';
        }

        return 'network';
    },

    /**
     * Gets appropriate error message based on error type and status
     */
    getErrorMessage(error: AxiosError): string {
        const errorType = this.getErrorType(error);
        const status = error.response?.status;

        switch (errorType) {
            case 'network':
                return this.extractErrorMessage(error, 'Erro de conexão. Verifique sua conexão com a internet e tente novamente.');
            
            case 'timeout':
                return this.extractErrorMessage(error, 'Tempo limite excedido. O servidor demorou muito para responder.');
            
            case 'auth':
                if (status === 401) {
                    return this.extractErrorMessage(error, 'Sessão expirada. Faça login novamente.');
                } else if (status === 403) {
                    return this.extractErrorMessage(error, 'Acesso negado. Você não tem permissão para acessar este recurso.');
                }
                return this.extractErrorMessage(error, 'Erro de autenticação. Verifique suas credenciais.');
            
            case 'server':
                if (status === 500) {
                    return this.extractErrorMessage(error, 'Erro interno do servidor. Tente novamente mais tarde.');
                } else if (status === 502) {
                    return this.extractErrorMessage(error, 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.');
                } else if (status === 503) {
                    return this.extractErrorMessage(error, 'Serviço temporariamente indisponível. Tente novamente mais tarde.');
                }
                return this.extractErrorMessage(error, `Erro do servidor (${status}). Tente novamente mais tarde.`);
            
            case 'client':
                if (status === 400) {
                    return this.extractErrorMessage(error, 'Dados inválidos. Verifique as informações enviadas.');
                } else if (status === 404) {
                    return this.extractErrorMessage(error, 'Recurso não encontrado. Verifique se o endereço está correto.');
                } else if (status === 422) {
                    return this.extractErrorMessage(error, 'Dados não puderam ser processados. Verifique as informações enviadas.');
                }
                return this.extractErrorMessage(error, `Erro na requisição (${status}). Verifique os dados enviados.`);
            
            default:
                return this.extractErrorMessage(error, 'Ocorreu um erro inesperado. Tente novamente.');
        }
    }
};

// Response interceptor with enhanced error handling
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        const status = error.response?.status;
        const errorType = ErrorHandler.getErrorType(error);

        // Log error details for debugging
        console.error('API Error Details:', {
            status,
            errorType,
            url: error.config?.url,
            method: error.config?.method,
            originalMessage: error.message,
            responseData: error.response?.data
        });

        // Handle authentication errors with special logic
        if (status === 401) {
            console.warn('401 Unauthorized: Invalid or expired token');
            
            // Clear token and redirect to login for authentication errors
            TokenManager.clearToken();
            window.location.href = '/login';
            
        } else if (status === 403) {
            console.warn('403 Forbidden: Access denied');
            
            // Don't redirect on 403 - user is authenticated but lacks permission
            // Let the component handle the error display
        }

        // Set enhanced error message that prevents "undefined" messages
        error.message = ErrorHandler.getErrorMessage(error);

        // Add error type to error object for component-level handling
        (error as any).errorType = errorType;
        (error as any).statusCode = status;

        return Promise.reject(error);
    }
);

// Utility function for components to handle API errors consistently
export const handleApiError = (error: any): string => {
    if (error?.response) {
        // Use the enhanced error message from interceptor, with fallback
        return error.message && error.message !== 'undefined' && error.message.trim() !== '' 
            ? error.message 
            : 'Erro desconhecido do servidor.';
    } else if (error?.request) {
        // Network error
        return 'Erro de conexão. Verifique sua conexão com a internet.';
    } else {
        // Other error - ensure we never return undefined
        const message = error?.message;
        if (message && message !== 'undefined' && message.trim() !== '') {
            return message;
        }
        return 'Ocorreu um erro inesperado.';
    }
};

// Export both the api instance, token manager, and error handler for use in other services
export { TokenManager, ErrorHandler };
export default api;
