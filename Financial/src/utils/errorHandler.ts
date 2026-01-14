// Utilitário para tratamento de erros e feedback do usuário

export interface ErrorInfo {
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  details?: string;
}

export class ErrorHandler {
  /**
   * Processa erros da API e retorna informações formatadas para o usuário
   */
  static processApiError(error: any): ErrorInfo {
    console.error('🔍 Processando erro da API:', error);

    // Erro de autorização customizado
    if (error.code) {
      switch (error.code) {
        case 'TOKEN_EXPIRED':
          return {
            message: 'Sua sessão expirou. Você será redirecionado para o login.',
            type: 'warning',
            code: error.code,
            details: 'Token de autenticação expirado'
          };
        
        case 'TOKEN_INVALID':
          return {
            message: 'Token de autenticação inválido. Faça login novamente.',
            type: 'error',
            code: error.code,
            details: 'Token malformado ou corrompido'
          };
        
        case 'TENANT_MISSING':
          return {
            message: 'Contexto do tenant não encontrado. Verifique sua conta e tente novamente.',
            type: 'error',
            code: error.code,
            details: 'Informações de tenant ausentes no token'
          };
        
        case 'UNAUTHORIZED':
          return {
            message: error.message || 'Acesso não autorizado.',
            type: 'error',
            code: error.code,
            details: 'Permissões insuficientes'
          };
      }
    }

    // Erros HTTP padrão
    if (error.response?.status) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          return {
            message: 'Dados inválidos enviados. Verifique os campos e tente novamente.',
            type: 'error',
            code: 'BAD_REQUEST',
            details: error.response.data?.message || 'Requisição malformada'
          };
        
        case 401:
          return {
            message: 'Credenciais inválidas. Faça login novamente.',
            type: 'error',
            code: 'UNAUTHORIZED',
            details: 'Token ausente ou inválido'
          };
        
        case 403:
          return {
            message: 'Você não tem permissão para realizar esta ação.',
            type: 'error',
            code: 'FORBIDDEN',
            details: 'Acesso negado pelo servidor'
          };
        
        case 404:
          return {
            message: 'Recurso não encontrado.',
            type: 'error',
            code: 'NOT_FOUND',
            details: 'Endpoint ou recurso inexistente'
          };
        
        case 422:
          return {
            message: 'Dados de entrada inválidos. Verifique os campos obrigatórios.',
            type: 'error',
            code: 'VALIDATION_ERROR',
            details: error.response.data?.message || 'Erro de validação'
          };
        
        case 429:
          return {
            message: 'Muitas tentativas. Aguarde um momento e tente novamente.',
            type: 'warning',
            code: 'RATE_LIMIT',
            details: 'Limite de requisições excedido'
          };
        
        case 500:
          return {
            message: 'Erro interno do servidor. Tente novamente mais tarde.',
            type: 'error',
            code: 'INTERNAL_ERROR',
            details: 'Erro no processamento do servidor'
          };
        
        case 502:
        case 503:
        case 504:
          return {
            message: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
            type: 'warning',
            code: 'SERVICE_UNAVAILABLE',
            details: 'Servidor sobrecarregado ou em manutenção'
          };
        
        default:
          return {
            message: `Erro inesperado (${status}). Tente novamente ou contate o suporte.`,
            type: 'error',
            code: 'UNKNOWN_HTTP_ERROR',
            details: `Status HTTP: ${status}`
          };
      }
    }

    // Erros de rede
    if (!error.response && error.request) {
      return {
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        type: 'error',
        code: 'NETWORK_ERROR',
        details: 'Falha na comunicação com o servidor'
      };
    }

    // Erro genérico
    return {
      message: error.message || 'Erro inesperado. Tente novamente.',
      type: 'error',
      code: 'UNKNOWN_ERROR',
      details: 'Erro não categorizado'
    };
  }

  /**
   * Registra erro detalhado para debugging
   */
  static logError(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    const errorInfo = this.processApiError(error);
    
    console.group(`🚨 Error Log - ${timestamp}`);
    console.log('Context:', context || 'Unknown');
    console.log('Error Info:', errorInfo);
    console.log('Original Error:', error);
    
    if (error.config) {
      console.log('Request Config:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      });
    }
    
    if (error.response) {
      console.log('Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    console.groupEnd();
  }

  /**
   * Determina se o erro é relacionado à autorização
   */
  static isAuthError(error: any): boolean {
    if (error.code && ['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TENANT_MISSING', 'UNAUTHORIZED'].includes(error.code)) {
      return true;
    }
    
    if (error.response?.status && [401, 403].includes(error.response.status)) {
      return true;
    }
    
    return false;
  }

  /**
   * Determina se o erro é de conectividade
   */
  static isNetworkError(error: any): boolean {
    return !error.response && error.request;
  }

  /**
   * Determina se o erro é de validação de dados
   */
  static isValidationError(error: any): boolean {
    return error.response?.status === 422 || error.response?.status === 400;
  }
}

export default ErrorHandler;