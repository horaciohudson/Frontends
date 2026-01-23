import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

/**
 * Hook para interceptar falhas de autenticação e redirecionar automaticamente
 * Este hook configura interceptors globais que trabalham com o contexto de autenticação
 */
export const useAuthInterceptor = () => {
    const { redirectToLogin, logout } = useAuth();

    useEffect(() => {
        // Interceptor de resposta para capturar erros de autenticação
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                const status = error.response?.status;

                // Intercepta erros 401 (Unauthorized) e redireciona para login
                if (status === 401) {
                    console.warn('401 Unauthorized detectado - redirecionando para login');
                    redirectToLogin();
                }

                // Para erros 403, não redireciona automaticamente, mas registra o evento
                if (status === 403) {
                    console.warn('403 Forbidden detectado - usuário autenticado mas sem permissão');
                    // Não redireciona automaticamente em 403, deixa o componente tratar
                }

                return Promise.reject(error);
            }
        );

        // Cleanup: remove o interceptor quando o componente é desmontado
        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [redirectToLogin, logout]);

    // Função para verificar periodicamente se o token ainda é válido
    useEffect(() => {
        const checkTokenValidity = () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const now = Math.floor(Date.now() / 1000);
                    
                    // Se o token expirou, redireciona para login
                    if (payload.exp < now) {
                        console.warn('Token expirado detectado durante verificação periódica');
                        redirectToLogin();
                    }
                } catch (error) {
                    console.error('Erro ao verificar validade do token:', error);
                    redirectToLogin();
                }
            }
        };

        // Verifica a validade do token a cada 5 minutos
        const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);

        // Cleanup
        return () => clearInterval(interval);
    }, [redirectToLogin]);
};