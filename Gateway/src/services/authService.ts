import api from './api';
import { AuthRequest, AuthResponse, User } from '../types';

export const authService = {
    async login(credentials: AuthRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            const user: User = {
                username: response.data.username || '',
                roles: response.data.roles || [],
            };
            localStorage.setItem('user', JSON.stringify(user));
        }

        return response.data;
    },

    async validateToken(): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/validate');
        return response.data;
    },

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },
};
