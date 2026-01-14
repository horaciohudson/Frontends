interface LoginCredentials {
  username: string;
  password: string;
  tenantCode: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface AuthUser {
  id: string;
  username: string;
  tenantId: string;
  tenantCode: string;
  tenantName?: string;
  roles: string[];
}

interface TokenValidation {
  isValid: boolean;
  isExpired: boolean;
  expiresIn: number; // seconds until expiration
  needsRefresh: boolean; // true if expires in < 5 minutes
}

class AuthService {
  private readonly API_BASE_URL = 'http://localhost:8081/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';
  private readonly REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

  private refreshPromise: Promise<string | null> | null = null;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciais inválidas');
        } else if (response.status === 423) {
          throw new Error('Conta bloqueada. Tente novamente mais tarde.');
        } else if (response.status === 404) {
          throw new Error('Tenant não encontrado');
        } else {
          throw new Error('Erro no servidor. Tente novamente.');
        }
      }

      const data: LoginResponse = await response.json();

      // Store tokens
      this.setToken(data.accessToken);
      this.setRefreshToken(data.refreshToken);

      // Decode and store user info from JWT
      const userInfo = this.decodeToken(data.accessToken);
      this.setUser(userInfo);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Valida o token atual e retorna informações detalhadas
   */
  validateToken(): TokenValidation {
    const token = this.getToken();

    if (!token) {
      return {
        isValid: false,
        isExpired: true,
        expiresIn: 0,
        needsRefresh: false
      };
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido - deve ter 3 partes');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const now = Date.now() / 1000;
      const expiresIn = payload.exp - now;
      const isExpired = expiresIn <= 0;
      const isValid = !isExpired;
      const needsRefresh = expiresIn <= this.REFRESH_THRESHOLD && expiresIn > 0;

      console.log('🔍 authService.validateToken:', {
        exp: payload.exp,
        expDate: new Date(payload.exp * 1000).toLocaleString(),
        now: now,
        nowDate: new Date(now * 1000).toLocaleString(),
        expiresIn: expiresIn,
        isValid: isValid,
        isExpired: isExpired,
        needsRefresh: needsRefresh,
        user: payload.username
      });

      return {
        isValid,
        isExpired,
        expiresIn: Math.max(0, expiresIn),
        needsRefresh
      };
    } catch (error) {
      console.log('❌ authService.validateToken - Erro ao decodificar token:', error);
      return {
        isValid: false,
        isExpired: true,
        expiresIn: 0,
        needsRefresh: false
      };
    }
  }

  /**
   * Método legado mantido para compatibilidade
   */
  isAuthenticated(): boolean {
    const validation = this.validateToken();
    return validation.isValid;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private decodeToken(token: string): AuthUser {
    try {
      console.log('🔍 decodeToken - Token recebido:', token.substring(0, 50) + '...');

      const parts = token.split('.');
      console.log('🔍 decodeToken - Partes do token:', parts.length);

      if (parts.length !== 3) {
        throw new Error('Token JWT inválido - deve ter 3 partes');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      console.log('🔍 decodeToken - Payload decodificado:', payload);
      console.log('🔍 decodeToken - Campos tenant disponíveis:', {
        code: payload.code,
        tenant_code: payload.tenant_code,
        tenantCode: payload.tenantCode,
        tenant_id: payload.tenant_id,
        tenantId: payload.tenantId
      });

      // Extract user information from JWT payload
      const userInfo = {
        id: payload.user_id || payload.sub || payload.id,
        username: payload.username || payload.preferred_username || payload.name,
        tenantId: payload.tenant_id || payload.tenantId,
        tenantCode: payload.code || payload.tenant_code || payload.tenantCode || (payload.tenant_id === '3c8dcdab-ab64-4d8e-90ce-99bfcbd2ddec' ? 'SIGEVE' : `T${payload.tenant_id || payload.tenantId}`),
        tenantName: payload.tenant_name || payload.tenantName,
        roles: payload.roles || payload.authorities || []
      };

      console.log('🔍 decodeToken - UserInfo extraído:', userInfo);

      return userInfo;
    } catch (error) {
      console.error('❌ decodeToken - Erro:', error);
      throw new Error('Token inválido');
    }
  }

  /**
   * Renova o token de acesso usando o refresh token
   * Implementa debouncing para evitar múltiplas chamadas simultâneas
   */
  async refreshAccessToken(): Promise<string | null> {
    // Se já há uma renovação em andamento, aguardar ela
    if (this.refreshPromise) {
      console.log('🔄 Aguardando renovação de token em andamento...');
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ Refresh token não encontrado');
      return null;
    }

    console.log('🔄 Iniciando renovação de token...');

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Limpar a promise após completar
      this.refreshPromise = null;
    }
  }

  /**
   * Executa a renovação do token
   */
  private async performTokenRefresh(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        console.error('❌ Falha ao renovar token:', response.status, response.statusText);
        this.logout();
        return null;
      }

      const data = await response.json();

      // Atualizar tokens e informações do usuário
      this.setToken(data.accessToken);
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      const userInfo = this.decodeToken(data.accessToken);
      this.setUser(userInfo);

      console.log('✅ Token renovado com sucesso');
      return data.accessToken;
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Garante que o token seja válido, renovando se necessário
   */
  async ensureValidToken(): Promise<string | null> {
    const validation = this.validateToken();

    if (!validation.isValid) {
      if (validation.isExpired) {
        console.log('🔄 Token expirado, tentando renovar...');
        return this.refreshAccessToken();
      }
      return null;
    }

    if (validation.needsRefresh) {
      console.log('🔄 Token próximo do vencimento, renovando proativamente...');
      // Renovar em background, mas retornar o token atual
      this.refreshAccessToken().catch(error => {
        console.error('❌ Falha na renovação proativa:', error);
      });
    }

    return this.getToken();
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.getToken();

    // Check if token is expired
    if (token && !this.isAuthenticated()) {
      // Try to refresh token
      token = await this.refreshAccessToken();
      if (!token) {
        throw new Error('Token de autenticação expirado. Faça login novamente.');
      }
    }

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    // Make the request with the token
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // If we get a 401, try to refresh the token once more
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        // Retry the request with the new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        throw new Error('Token de autenticação expirado. Faça login novamente.');
      }
    }

    return response;
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
export type { LoginCredentials, LoginResponse, AuthUser, TokenValidation };