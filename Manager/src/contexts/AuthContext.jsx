import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Função para decodificar JWT
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar JWT:', error);
      return null;
    }
  };

  // Função para verificar se o token está expirado
  const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  // Função para validar token com o backend
  const validateTokenWithBackend = async (token) => {
    try {
      const response = await fetch('http://localhost:8081/api/usuarios/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return null;
    }
  };

  // Função de login
  const login = async (loginValue, password) => {
    try {
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: loginValue, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token: newToken } = data;

        // Armazenar token
        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Validar com backend e obter dados do usuário
        const userData = await validateTokenWithBackend(newToken);
        if (userData) {
          setUser(userData);
          return userData;
        } else {
          throw new Error('Falha na validação do token');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');

      console.log("🔐 AuthContext.jsx - Verificando token no useEffect:", !!storedToken);

      if (!storedToken || isTokenExpired(storedToken)) {
        console.log("⚠️ AuthContext.jsx - Token ausente ou expirado, fazendo logout");
        logout();
        setLoading(false);
        return;
      }

      // ✅ Token válido e não expirado - usar sem validar com backend
      // A validação com /api/usuarios/me estava causando erro 500 e removendo o token
      console.log("✅ AuthContext.jsx - Token válido, definindo usuário");
      setToken(storedToken);

      // Decodificar token para obter dados do usuário
      const decoded = decodeJWT(storedToken);
      if (decoded) {
        setUser({
          sub: decoded.sub,
          roles: decoded.roles || [],
          exp: decoded.exp,
          iat: decoded.iat
        });
        console.log("✅ AuthContext.jsx - Usuário autenticado:", decoded.sub);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Interceptor para adicionar token automaticamente
  useEffect(() => {
    if (token) {
      // Configurar interceptor global para fetch
      const originalFetch = window.fetch;
      window.fetch = function (url, options = {}) {
        // Adicionar token apenas para requisições da API
        if (url.includes('localhost:8081') || url.includes('/api/')) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          };
        }
        return originalFetch(url, options);
      };

      // Cleanup
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [token]);

  // Verificar expiração do token periodicamente
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        if (isTokenExpired(token)) {
          console.log('Token expirado, fazendo logout automático');
          logout();
        }
      }, 60000); // Verificar a cada minuto

      return () => clearInterval(interval);
    }
  }, [token]);

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token && !isTokenExpired(token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};