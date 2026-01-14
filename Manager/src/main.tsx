import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './routes/AuthContext'; // ✅ ajuste o caminho se necessário
import './index.css';
import "./i18n";


const ORIGEM_ESPERADA = 'http://localhost:5173';

if (window.location.origin !== ORIGEM_ESPERADA) {
  alert(
    `⚠️ Você está acessando a aplicação por ${window.location.origin}, mas o esperado é ${ORIGEM_ESPERADA}.\nIsso pode causar falhas de autenticação e perda do token.`
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ obrigatório para o contexto funcionar */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);