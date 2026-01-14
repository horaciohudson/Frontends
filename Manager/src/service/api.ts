import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // usa proxy do Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instância para endpoints sem prefixo /api (como tax-situations)
export const apiNoPrefix = axios.create({
  baseURL: '', // usa proxy do Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Aplicar interceptors para ambas as instâncias
const applyInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        console.warn("Token expirado ou inválido. Erro:", error.response?.status);

        // Remove o token armazenado apenas se for realmente um problema de autenticação
        if (error.response?.data?.message?.includes('token') ||
          error.response?.data?.message?.includes('authentication') ||
          error.response?.data?.message?.includes('unauthorized') ||
          error.response?.data?.message?.includes('expired')) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } else if (error.response?.status === 403) {
        console.warn("Acesso negado:", error.response?.data?.message);
      }

      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    console.log("🔐 Interceptor - Token encontrado:", !!token);
    console.log("🔐 Interceptor - URL da requisição:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Interceptor - Authorization header adicionado");

      // Verifica se o token não expirou antes de enviar
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);

        console.log("🕐 Token exp:", payload.exp, "| Agora:", now, "| Válido:", payload.exp > now);

        if (payload.exp < now) {
          console.log("❌ Token expirado, redirecionando para login");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(new Error("Token expirado"));
        }
      } catch (err: unknown) {
        console.error("❌ Erro ao verificar token - token pode estar corrompido:", err);
        console.error("❌ Token que causou erro:", token.substring(0, 50) + "...");
        // NÃO remove o token aqui - pode ser um erro temporário
      }
    } else {
      console.log("⚠️ Nenhum token encontrado no localStorage");
    }

    return config;
  }, error => {
    // Erro no request interceptor - NÃO remove o token
    console.error("❌ Erro no request interceptor:", error);
    return Promise.reject(error);
  });
};

applyInterceptors(api);
applyInterceptors(apiNoPrefix);

export default api;
