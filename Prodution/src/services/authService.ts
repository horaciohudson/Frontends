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
    expiresIn: number;
    needsRefresh: boolean;
}

class AuthService {
    private readonly API_BASE_URL = '/api';
    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'auth_user';
    private readonly REFRESH_THRESHOLD = 5 * 60;

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

            this.setToken(data.accessToken);
            this.setRefreshToken(data.refreshToken);

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
        sessionStorage.removeItem('selectedCompanyId');
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
                throw new Error('Token JWT inválido');
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

            return {
                isValid,
                isExpired,
                expiresIn: Math.max(0, expiresIn),
                needsRefresh
            };
        } catch (error) {
            return {
                isValid: false,
                isExpired: true,
                expiresIn: 0,
                needsRefresh: false
            };
        }
    }

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
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token JWT inválido');
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

            const userInfo = {
                id: payload.user_id || payload.sub || payload.id,
                username: payload.username || payload.preferred_username || payload.name,
                tenantId: payload.tenant_id || payload.tenantId,
                tenantCode: payload.code || payload.tenant_code || payload.tenantCode,
                tenantName: payload.tenant_name || payload.tenantName,
                roles: payload.roles || payload.authorities || []
            };

            return userInfo;
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    async refreshAccessToken(): Promise<string | null> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return null;
        }

        this.refreshPromise = this.performTokenRefresh(refreshToken);

        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.refreshPromise = null;
        }
    }

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
                this.logout();
                return null;
            }

            const data = await response.json();

            this.setToken(data.accessToken);
            if (data.refreshToken) {
                this.setRefreshToken(data.refreshToken);
            }

            const userInfo = this.decodeToken(data.accessToken);
            this.setUser(userInfo);

            return data.accessToken;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    async ensureValidToken(): Promise<string | null> {
        const validation = this.validateToken();

        if (!validation.isValid) {
            if (validation.isExpired) {
                return this.refreshAccessToken();
            }
            return null;
        }

        if (validation.needsRefresh) {
            this.refreshAccessToken().catch(error => {
                console.error('Falha na renovação proativa:', error);
            });
        }

        return this.getToken();
    }

    async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.ensureValidToken();

        if (!token) {
            throw new Error('Não autenticado');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };

        return fetch(url, {
            ...options,
            headers,
        });
    }

    getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}

export const authService = new AuthService();
export type { LoginCredentials, LoginResponse, AuthUser, TokenValidation };
