
import { Navigate } from 'react-router-dom';
import { useAuth } from './routes/AuthContext';
import { JSX } from 'react';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // ✅ Aqui podemos avisar o usuário antes de redirecionar
    alert('Sessão expirada ou inválida. Faça login novamente.');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
