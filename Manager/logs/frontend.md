Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
AuthContext.tsx:34 [12:13:44.540] 🔐 AuthContext - Verificando token no useEffect: false
AuthContext.tsx:34 [12:13:44.540] ⚠️ AuthContext - Nenhum token encontrado
AuthContext.tsx:34 [12:13:44.541] 🔐 AuthContext - Verificando token no useEffect: false
AuthContext.tsx:34 [12:13:44.541] ⚠️ AuthContext - Nenhum token encontrado
AuthContext.jsx:119 🔐 AuthContext.jsx - Verificando token no useEffect: false
AuthContext.jsx:122 ⚠️ AuthContext.jsx - Token ausente ou expirado, fazendo logout
AuthContext.jsx:119 🔐 AuthContext.jsx - Verificando token no useEffect: false
AuthContext.jsx:122 ⚠️ AuthContext.jsx - Token ausente ou expirado, fazendo logout
AuthContext.tsx:34 [12:14:44.797] 🔑 AuthContext - Iniciando login...
api.ts:45 🔐 Interceptor - Token encontrado: false
api.ts:46 🔐 Interceptor - URL da requisição: /auth/login
api.ts:71 ⚠️ Nenhum token encontrado no localStorage
api/auth/login:1   Failed to load resource: the server responded with a status of 500 (Internal Server Error)
AuthContext.tsx:106  ❌ AuthContext - Erro no login: AxiosErrorcode: "ERR_BAD_RESPONSE"config: {transitional: {…}, adapter: Array(3), transformRequest: Array(1), transformResponse: Array(1), timeout: 0, …}message: "Request failed with status code 500"name: "AxiosError"request: XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, …}response: {data: '', status: 500, statusText: 'Internal Server Error', headers: AxiosHeaders, config: {…}, …}status: 500stack: "AxiosError: Request failed with status code 500\n    at settle (http://localhost:5173/node_modules/.vite/deps/axios.js?v=94386f90:1232:12)\n    at XMLHttpRequest.onloadend (http://localhost:5173/node_modules/.vite/deps/axios.js?v=94386f90:1564:7)\n    at Axios.request (http://localhost:5173/node_modules/.vite/deps/axios.js?v=94386f90:2122:41)\n    at async login (http://localhost:5173/src/routes/AuthContext.tsx:64:24)\n    at async handleSubmit (http://localhost:5173/src/LoginPage.tsx:31:7)"[[Prototype]]: Error
login @ AuthContext.tsx:106