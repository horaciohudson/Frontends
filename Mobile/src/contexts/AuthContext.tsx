// Contexto de Autenticação
// Adaptado do frontend web

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { authAPI } from '../services/api';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type { User, RegisterData } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    checkAuth: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar autenticação ao iniciar
    useEffect(() => {
        checkAuth();
    }, []);

    // Verificar status de autenticação
    const checkAuth = async () => {
        try {
            const token = await storage.getItem(STORAGE_KEYS.TOKEN);
            const userStr = await storage.getItem(STORAGE_KEYS.USER);

            if (token && userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (username: string, password: string) => {
        try {
            const response = await authAPI.login(username, password);
            const data = response.data.data;

            if (data?.token) {
                // Salvar token
                await storage.setItem(STORAGE_KEYS.TOKEN, data.token);

                // Criar objeto de usuário
                const userData: User = {
                    id: data.userId,
                    username: data.username,
                    email: data.email,
                    firstName: (data as any).firstName,
                    lastName: (data as any).lastName,
                    roles: data.roles || [],
                    groups: (data as any).groups || [],
                    privileges: (data as any).privileges || [],
                };

                // Salvar dados do usuário
                await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
                await storage.setItem(
                    STORAGE_KEYS.USER_TYPE,
                    userData.roles.includes('ADMIN') ? 'admin' : 'user'
                );

                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error: any) {
            console.error('Erro no login:', error);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        await storage.removeItem(STORAGE_KEYS.TOKEN);
        await storage.removeItem(STORAGE_KEYS.USER);
        await storage.removeItem(STORAGE_KEYS.USER_TYPE);
        setUser(null);
        setIsAuthenticated(false);
    };

    // Registro
    const register = async (data: RegisterData) => {
        try {
            await authAPI.register(data);
        } catch (error: any) {
            console.error('Erro no registro:', error);
            throw error;
        }
    };

    // Verificar se usuário tem uma role específica
    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) || false;
    };

    // Verificar se usuário tem alguma das roles especificadas
    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some(role => hasRole(role));
    };

    // Memoizar o valor do contexto para evitar re-renders
    const value = useMemo<AuthContextType>(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        checkAuth,
        hasRole,
        hasAnyRole,
        isAdmin: user?.roles?.includes('ADMIN') || false,
    }), [user, isAuthenticated, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook customizado
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
