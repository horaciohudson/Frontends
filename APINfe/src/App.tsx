import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthInterceptorWrapper } from './components/common/AuthInterceptorWrapper';
import { PrivateRoute } from './components/common/PrivateRoute';
import { SessionTimeoutNotification } from './components/common/SessionTimeoutNotification';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/cadastros/ProductsPage';
import { CustomersPage } from './pages/cadastros/CustomersPage';
import { NFeEmissaoPage } from './pages/nfe/NFeEmissaoPage';
import { NFeListagemPage } from './pages/nfe/NFeListagemPage';
import { NFeDetalhesPage } from './pages/nfe/NFeDetalhesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Navigate to="/dashboard" />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/nfe/emitir"
        element={
          <PrivateRoute>
            <Layout>
              <NFeEmissaoPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/nfe/listagem"
        element={
          <PrivateRoute>
            <Layout>
              <NFeListagemPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/nfe/detalhes/:id"
        element={
          <PrivateRoute>
            <Layout>
              <NFeDetalhesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/produtos"
        element={
          <PrivateRoute>
            <Layout>
              <ProductsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/clientes"
        element={
          <PrivateRoute>
            <Layout>
              <CustomersPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <PrivateRoute>
            <Layout>
              <div>Configurações (em desenvolvimento)</div>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

// Component to handle session timeout notifications
function SessionTimeoutHandler() {
  const { error } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeoutReason, setTimeoutReason] = useState<string>();

  useEffect(() => {
    if (error && error.includes('Sessão expirada')) {
      // Extract reason from error message
      let reason: string | undefined;
      if (error.includes('inatividade')) {
        reason = 'inactive';
      } else if (error.includes('tempo limite')) {
        reason = 'expired';
      } else if (error.includes('token inválido')) {
        reason = 'corrupted';
      }
      
      setTimeoutReason(reason);
      setShowTimeout(true);
    }
  }, [error]);

  return (
    <SessionTimeoutNotification
      open={showTimeout}
      onClose={() => setShowTimeout(false)}
      reason={timeoutReason}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AuthInterceptorWrapper>
              <SessionTimeoutHandler />
              <AppRoutes />
            </AuthInterceptorWrapper>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
