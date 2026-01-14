import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  console.log('🛡️ AdminRoute - Iniciando verificação de acesso');
  
  // Debug: Verificar estado do localStorage
  console.log('🔍 AdminRoute - Debug localStorage:', {
    token: localStorage.getItem('auth_token') ? 'Existe' : 'Não existe',
    user: localStorage.getItem('auth_user') ? 'Existe' : 'Não existe',
    refreshToken: localStorage.getItem('refresh_token') ? 'Existe' : 'Não existe'
  });

  // Verifica se o usuário está autenticado
  const isAuthenticated = authService.isAuthenticated();
  console.log('🔐 AdminRoute - isAuthenticated resultado:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('❌ AdminRoute - Usuário não autenticado, redirecionando para /');
    return <Navigate to="/" replace />;
  }

  // Verifica se o usuário tem a role de admin
  const user = authService.getUser();
  console.log('👤 AdminRoute - Usuário atual:', user);
  
  if (!user) {
    console.log('❌ AdminRoute - Usuário não encontrado, redirecionando para /');
    return <Navigate to="/" replace />;
  }

  const hasAdminRole = user.roles && user.roles.includes('ROLE_ADMIN');
  console.log('🔑 AdminRoute - Verificação de role ADMIN:', {
    roles: user.roles,
    hasAdminRole: hasAdminRole
  });

  if (!hasAdminRole) {
    console.log('❌ AdminRoute - Usuário sem permissão de admin');
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#dc3545' }}>Acesso Negado</h3>
        <p>Você não tem permissão para acessar esta página.</p>
        <p>É necessário ter privilégios de administrador.</p>
      </div>
    );
  }

  console.log('✅ AdminRoute - Acesso autorizado, renderizando componente');
  return <>{children}</>;
};

export default AdminRoute;