import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { TokenManager } from '../services/api';
import { SessionManager, SessionValidationResult } from '../utils/sessionManager';

// Estrutura do token JWT (deve corresponder ao que o backend envia)
interface JwtPayload {
    sub: string;              // username
    userId: string;           // UUID do usuário
    tenantId: string;         // UUID do tenant/empresa
    tenantCode: string;       // Código do tenant (ex: "SIGEVE")
    roles: string[];          // Roles do usuário
    language?: string;        // Idioma preferido
    isSystemAdmin: boolean;   // Se é admin do sistema
    exp: number;              // Timestamp de expiração
    iat: number;              // Timestamp de emissão
    companyId?: string;       // Alias para tenantId (para compatibilidade)
}

// Interface do estado de autenticação
interface AuthState {
    isAuthenticated: boolean;
    user: JwtPayload | null;
    loading: boolean;
    error: string | null;
    sessionInfo?: {
        hasSession: boolean;
        isValid: boolean;
        age?: number;
        inactivity?: number;
        reason?: string;
    };
}

// Interface do contexto
interface AuthContextData extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    checkAuthStatus: () => void;
    redirectToLogin: () => void;
    handleSessionTimeout: (reason?: string) => void;
    refreshSessionInfo: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        loading: true,
        error: null,
        sessionInfo: undefined
    });

    // Função para atualizar informações da sessão
    const refreshSessionInfo = () => {
        const sessionInfo = SessionManager.getSessionInfo();
        setAuthState(prev => ({ ...prev, sessionInfo }));
    };

    // Função para lidar com timeout de sessão
    const handleSessionTimeout = useCallback((reason?: string) => {
        console.warn(`Sessão expirada: ${reason || 'motivo desconhecido'}`);

        // Limpa a sessão
        SessionManager.clearSession();
        TokenManager.clearToken();

        // Atualiza o estado
        setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            error: `Sessão expirada: ${reason === 'inactive' ? 'inatividade' : reason === 'expired' ? 'tempo limite' : 'token inválido'}. Faça login novamente.`,
            sessionInfo: SessionManager.getSessionInfo()
        }));

        // Redireciona para login após um breve delay
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    }, []);

    // Função para verificar e validar token/sessão existente
    const validateExistingSession = useCallback((): boolean => {
        // Inicializa o SessionManager e obtém validação
        const validation: SessionValidationResult = SessionManager.initialize();

        if (!validation.isValid) {
            if (validation.reason && validation.session) {
                // Sessão inválida encontrada
                handleSessionTimeout(validation.reason);
            }
            return false;
        }

        const { session } = validation;
        if (!session) return false;

        try {
            // Sincroniza com TokenManager
            TokenManager.setToken(session.token);

            // Verifica se o token ainda é válido via TokenManager
            if (TokenManager.isTokenExpired(session.token)) {
                console.warn('Token expirado detectado via TokenManager');
                handleSessionTimeout('expired');
                return false;
            }

            // Decodifica o token para obter informações do usuário
            const decoded = jwtDecode<JwtPayload>(session.token);
            const userWithLanguage = {
                ...decoded,
                language: decoded.language || 'pt',
                companyId: decoded.tenantId  // Alias para compatibilidade
            };

            setAuthState(prev => ({
                ...prev,
                user: userWithLanguage,
                isAuthenticated: true,
                error: null,
                sessionInfo: SessionManager.getSessionInfo()
            }));

            return true;
        } catch (err) {
            console.error('Erro ao validar sessão existente:', err);
            handleSessionTimeout('corrupted');
            return false;
        }
    }, [handleSessionTimeout]);

    // Função para verificar status de autenticação
    const checkAuthStatus = useCallback(() => {
        setAuthState(prev => ({ ...prev, loading: true }));

        const isValid = validateExistingSession();

        setAuthState(prev => ({
            ...prev,
            loading: false,
            isAuthenticated: isValid,
            sessionInfo: SessionManager.getSessionInfo()
        }));
    }, [validateExistingSession]);

    // Função para redirecionar para login
    const redirectToLogin = useCallback(() => {
        // Limpa tokens e sessão
        SessionManager.clearSession();
        TokenManager.clearToken();

        // Redireciona para a página de login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
            window.location.href = '/login';
        }
    }, []);

    // Efeito para verificar autenticação na inicialização
    useEffect(() => {
        console.log('AuthProvider: Inicializando verificação de autenticação...');
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Efeito para monitorar mudanças de sessão em outras abas
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === 'apinfe_session') {
                console.log('Mudança detectada no storage, verificando autenticação...');
                if (!e.newValue) {
                    // Token/sessão foi removido em outra aba
                    setAuthState(prev => ({
                        ...prev,
                        isAuthenticated: false,
                        user: null,
                        error: null,
                        sessionInfo: SessionManager.getSessionInfo()
                    }));
                } else {
                    // Token/sessão foi atualizado em outra aba
                    checkAuthStatus();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [checkAuthStatus]);

    // Efeito para monitorar sessão periodicamente
    useEffect(() => {
        if (!authState.isAuthenticated) return;

        const interval = setInterval(() => {
            const validation = SessionManager.validateSession();

            if (!validation.isValid && validation.reason) {
                console.warn('Sessão inválida detectada durante monitoramento periódico');
                handleSessionTimeout(validation.reason);
            } else {
                // Atualiza informações da sessão
                refreshSessionInfo();
            }
        }, 60000); // Verifica a cada minuto

        return () => clearInterval(interval);
    }, [authState.isAuthenticated, handleSessionTimeout]);

    const login = async (username: string, password: string) => {
        try {
            setAuthState(prev => ({
                ...prev,
                loading: true,
                error: null
            }));

            const response = await api.post('/auth/login', {
                login: username,
                senha: password,
            });

            const token = response.data.token;

            if (!token) {
                throw new Error('Token não recebido do servidor');
            }

            // Decodifica e valida o token
            const decoded = jwtDecode<JwtPayload>(token);
            const userWithLanguage = {
                ...decoded,
                language: decoded.language || 'pt',
                companyId: decoded.tenantId  // Alias para compatibilidade
            };

            // Usa o TokenManager para armazenar o token
            TokenManager.setToken(token);

            // Salva a sessão usando SessionManager
            SessionManager.saveSession(token, userWithLanguage);

            setAuthState({
                isAuthenticated: true,
                user: userWithLanguage,
                loading: false,
                error: null,
                sessionInfo: SessionManager.getSessionInfo()
            });

            console.log('Login realizado com sucesso, sessão salva');

        } catch (err: any) {
            console.error('Erro no login:', err);

            // Extrai mensagem de erro significativa
            let errorMessage = 'Erro ao fazer login. Tente novamente.';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = 'Credenciais inválidas. Verifique seu usuário e senha.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Acesso negado. Você não tem permissão para acessar o sistema.';
            } else if (!err.response) {
                errorMessage = 'Erro de conexão. Verifique sua conexão com a internet.';
            }

            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                isAuthenticated: false,
                user: null,
                sessionInfo: SessionManager.getSessionInfo()
            }));

            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        // Para o monitoramento de atividade
        SessionManager.stopActivityMonitoring();

        // Limpa a sessão usando SessionManager
        SessionManager.clearSession();

        // Usa o TokenManager para limpar o token
        TokenManager.clearToken();

        setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
            sessionInfo: SessionManager.getSessionInfo()
        });

        console.log('Logout realizado, sessão limpa');
    };

    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

    // Não renderiza nada enquanto está carregando na inicialização
    if (authState.loading && authState.user === null) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            logout,
            clearError,
            checkAuthStatus,
            redirectToLogin,
            handleSessionTimeout,
            refreshSessionInfo
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
