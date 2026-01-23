import React, { ReactNode } from 'react';
import { useAuthInterceptor } from '../../hooks/useAuthInterceptor';

interface AuthInterceptorWrapperProps {
    children: ReactNode;
}

/**
 * Componente wrapper que ativa os interceptors de autenticação
 * Deve ser usado dentro do AuthProvider para ter acesso ao contexto de autenticação
 */
export const AuthInterceptorWrapper: React.FC<AuthInterceptorWrapperProps> = ({ children }) => {
    // Ativa os interceptors de autenticação
    useAuthInterceptor();

    return <>{children}</>;
};