import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../service/api';
import { jwtDecode } from 'jwt-decode';

// Estrutura do token JWT
interface JwtPayload {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
  language?: string; // Adicionando propriedade de idioma
}

// Interface do contexto
interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtPayload | null;
  login: (username: string, senha: string) => Promise<void>;
  logout: () => void;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor do contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true); // ⏳ loading control

  // Helper para adicionar timestamp aos logs
  const logWithTime = (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12); // HH:MM:SS.mmm
    console.log(`[${timestamp}] ${message}`, ...args);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    logWithTime("🔐 AuthContext - Verificando token no useEffect:", !!token);

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const now = Math.floor(Date.now() / 1000);

        logWithTime("🕐 AuthContext - Token exp:", decoded.exp, "| Agora:", now, "| Válido:", decoded.exp > now);

        if (decoded.exp < now) {
          logWithTime("❌ AuthContext - Token expirado, fazendo logout");
          logout();
        } else {
          const userWithLanguage = {
            ...decoded,
            language: decoded.language || 'pt'
          };
          setUser(userWithLanguage);
          setIsAuthenticated(true);
          logWithTime("✅ AuthContext - Usuário autenticado:", decoded.sub);
        }
      } catch (err) {
        console.error("❌ AuthContext - Erro ao decodificar token:", err);
        console.error("❌ AuthContext - Token que causou erro:", token.substring(0, 50) + "...");
        // IMPORTANTE: Só faz logout se o token estiver realmente malformado
        // Não faz logout em caso de outros erros
        logout();
      }
    } else {
      logWithTime("⚠️ AuthContext - Nenhum token encontrado");
    }
    setLoading(false);
  }, []);

  const login = async (username: string, senha: string) => {
    try {
      logWithTime("🔑 AuthContext - Iniciando login...");
      const response = await api.post('/auth/login', {
        username: username,
        password: senha,
      });

      const token = response.data.token;
      logWithTime("🔑 AuthContext - Token recebido do servidor:", token.substring(0, 50) + "...");

      localStorage.setItem('token', token);
      logWithTime("✅ AuthContext - Token SALVO no localStorage");

      // Verificar imediatamente se o token foi salvo
      const tokenVerificacao = localStorage.getItem('token');
      if (tokenVerificacao === token) {
        logWithTime("✅ AuthContext - Verificação: Token CONFIRMADO no localStorage");
      } else {
        console.error("❌ AuthContext - ERRO: Token NÃO foi salvo corretamente!");
        console.error("❌ Esperado:", token.substring(0, 50) + "...");
        console.error("❌ Encontrado:", tokenVerificacao ? tokenVerificacao.substring(0, 50) + "..." : "null");
      }

      const decoded = jwtDecode<JwtPayload>(token);
      const userWithLanguage = {
        ...decoded,
        language: decoded.language || 'pt'
      };
      setUser(userWithLanguage);
      setIsAuthenticated(true);
      logWithTime("✅ AuthContext - Login concluído com sucesso para:", decoded.sub);
    } catch (err) {
      console.error("❌ AuthContext - Erro no login:", err);
      throw err;
    }
  };

  const logout = () => {
    const tokenAntes = localStorage.getItem('token');
    logWithTime("🚪 AuthContext - LOGOUT CHAMADO!");
    logWithTime("🔍 Token ANTES do logout:", tokenAntes ? tokenAntes.substring(0, 50) + "..." : "null");
    console.trace("🔍 Stack trace do logout:");

    localStorage.removeItem('token');

    const tokenDepois = localStorage.getItem('token');
    logWithTime("🔍 Token DEPOIS do logout:", tokenDepois ? tokenDepois.substring(0, 50) + "..." : "null");

    setUser(null);
    setIsAuthenticated(false);
    logWithTime("✅ Logout concluído");
  };

  if (loading) return null; // ⚠️ Evita renderizar a árvore antes de verificar o token

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acesso ao contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
