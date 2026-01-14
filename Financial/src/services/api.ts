// Configuração base da API com Axios

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8081/api';

// Interfaces para melhor tipagem
interface ApiRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuth?: boolean; // Para requisições que não precisam de auth
}

interface AuthHeaders {
  'Authorization': string;
  'X-Tenant-ID': string;
  'X-Company-ID'?: string;
  'Content-Type': string;
}

interface AuthError extends Error {
  code: 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'TENANT_MISSING' | 'UNAUTHORIZED';
  status: number;
}

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função para validar e garantir token válido antes de fazer requisições
const ensureValidTokenForRequest = async (): Promise<string | null> => {
  try {
    const token = await authService.ensureValidToken();
    if (!token) {
      console.warn('⚠️ Não foi possível obter token válido');
      return null;
    }
    return token;
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    return null;
  }
};

// Função para criar erro de autorização tipado
const createAuthError = (message: string, code: AuthError['code'], status: number): AuthError => {
  const error = new Error(message) as AuthError;
  error.code = code;
  error.status = status;
  return error;
};

// Interceptor de requisição - adiciona token de autenticação e tenant ID
api.interceptors.request.use(
  async (config: ApiRequestConfig) => {
    // Pular autenticação se explicitamente solicitado
    if (config._skipAuth) {
      return config;
    }

    // Garantir token válido antes de fazer a requisição
    const token = await ensureValidTokenForRequest();
    if (!token) {
      console.error('❌ Não foi possível obter token válido');
      authService.logout();
      window.location.href = '/login';
      throw createAuthError('Sessão expirada. Redirecionando para login.', 'TOKEN_EXPIRED', 401);
    }

    const user = authService.getUser();

    // Garantir que o token seja incluído em todas as requisições
    config.headers.Authorization = `Bearer ${token}`;

    // Garantir que o contexto do tenant seja incluído
    if (user?.tenantId) {
      config.headers['X-Tenant-ID'] = user.tenantId;

      // Exigir selectedCompanyId - SEM FALLBACK
      const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

      if (!selectedCompanyId) {
        throw new Error('❌ ERRO CRÍTICO: selectedCompanyId não está configurado no sessionStorage. O usuário DEVE selecionar uma empresa antes de fazer qualquer operação.');
      }

      // Adicionar headers e query parameter
      config.headers['X-Company-ID'] = selectedCompanyId;

      // Adicionar companyId como query parameter apenas para GET requests
      const method = config.method?.toUpperCase();
      console.log('🔍 Verificando se deve adicionar companyId:', {
        url: config.url,
        method: method,
        isGet: method === 'GET',
        hasCompanyId: config.url?.includes('companyId=')
      });

      if (config.url && !config.url.includes('companyId=') && method === 'GET') {
        const separator = config.url.includes('?') ? '&' : '?';
        config.url = `${config.url}${separator}companyId=${selectedCompanyId}`;
        console.log('✅ CompanyId adicionado à URL:', config.url);
      } else {
        console.log('⏭️ CompanyId NÃO adicionado à URL (método não é GET ou já tem companyId)');
      }

      console.log('🔍 API Request:', {
        url: config.url,
        method: config.method,
        tenantId: user.tenantId,
        companyId: selectedCompanyId,
        tenantIdType: typeof user.tenantId,
        tenantCode: user.tenantCode,
        hasToken: !!token,
        userRoles: user.roles,
        userId: user.id,
        username: user.username,
        'X-Tenant-ID': config.headers['X-Tenant-ID'],
        'X-Company-ID': config.headers['X-Company-ID']
      });
    } else {
      console.error('❌ Contexto do tenant não encontrado:', user);
      throw createAuthError('Contexto do tenant não encontrado', 'TENANT_MISSING', 403);
    }

    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata erros de autenticação e outros erros
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      dataSize: response.data ? JSON.stringify(response.data).length : 0
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ApiRequestConfig;

    // Log detalhado do erro para debugging
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      isNetworkError: !error.response,
      headers: error.config?.headers
    });

    // Categorizar e tratar diferentes tipos de erro
    if (!error.response) {
      // Erro de rede/conectividade
      const networkError = createAuthError('Erro de conectividade. Verifique sua conexão com a internet.', 'UNAUTHORIZED', 0);
      return Promise.reject(networkError);
    }

    const status = error.response.status;

    // Tratar erro 401 (Unauthorized)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Tentando renovar token...');
        const newToken = await authService.refreshAccessToken();

        if (newToken) {
          console.log('✅ Token renovado com sucesso');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Garantir que os headers de tenant sejam mantidos
          const user = authService.getUser();
          if (user?.tenantId) {
            originalRequest.headers['X-Tenant-ID'] = user.tenantId;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Falha ao renovar token:', refreshError);
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(createAuthError('Sessão expirada. Redirecionando para login.', 'TOKEN_EXPIRED', 401));
      }
    }

    // Tratar erro 403 (Forbidden)
    if (status === 403) {
      const user = authService.getUser();
      let errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';

      if (!user?.tenantId) {
        errorMessage = 'Contexto do tenant não encontrado. Faça login novamente.';
      } else {
        errorMessage = `Acesso negado para o tenant ${user.tenantCode || user.tenantId}. Verifique suas permissões.`;
      }

      return Promise.reject(createAuthError(errorMessage, 'UNAUTHORIZED', 403));
    }

    // Tratar outros erros do servidor
    if (status >= 500) {
      return Promise.reject(createAuthError('Erro interno do servidor. Tente novamente mais tarde.', 'UNAUTHORIZED', status));
    }

    // Para outros erros, manter o comportamento original
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
export type { ApiRequestConfig, AuthHeaders, AuthError };
