import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './components/Dashboard'
import ProductionProductsPage from './pages/ProductionProductsPage'
import CompaniesPage from './pages/CompaniesPage'
import RawMaterialsPage from './pages/RawMaterialsPage'
import CompositionsPage from './pages/CompositionsPage'
import ProductionStepsPage from './pages/ProductionStepsPage'
import ServicesPage from './pages/ServicesPage'
import TenantsPage from './pages/TenantsPage'
import UserPage from './pages/UserPage'
import PermissionsPage from './pages/PermissionsPage'
import ProductionOrdersPage from './pages/ProductionOrdersPage'
import ProductionExecutionsPage from './pages/ProductionExecutionsPage'
import ProductionClosuresPage from './pages/ProductionClosuresPage'
import RawMaterialStockPage from './pages/RawMaterialStockPage'
import RawMaterialMovementsPage from './pages/RawMaterialMovementsPage'
import ProductionCostsPage from './pages/ProductionCostsPage'
import { authService, type LoginCredentials } from './services/authService'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState<string>('')
  const [user, setUser] = useState(authService.getUser())

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();

      if (token) {
        try {
          const isAuth = authService.isAuthenticated();

          if (isAuth) {
            const user = authService.getUser();
            setUser(user);
            setIsAuthenticated(true);
          } else {
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao verificar token:', error);
          authService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [])

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setLoginError('')

    try {
      await authService.login(credentials)
      setUser(authService.getUser())
      setIsAuthenticated(true)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          <LoginForm
            onLogin={handleLogin}
            isLoading={isLoading}
            error={loginError}
          />
        ) : (
          <Routes>
            <Route path="/dashboard" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <Dashboard user={user || undefined} />
              </DashboardLayout>
            } />

            {/* Rotas Operacionais */}
            <Route path="/ordens-producao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ProductionOrdersPage />
              </DashboardLayout>
            } />

            <Route path="/execucao-producao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ProductionExecutionsPage />
              </DashboardLayout>
            } />

            <Route path="/fechamento-producao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ProductionClosuresPage />
              </DashboardLayout>
            } />

            <Route path="/estoque-materias-primas" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <RawMaterialStockPage />
              </DashboardLayout>
            } />

            <Route path="/movimentacoes-materias-primas" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <RawMaterialMovementsPage />
              </DashboardLayout>
            } />

            <Route path="/custos-producao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ProductionCostsPage />
              </DashboardLayout>
            } />

            {/* Rotas de Configuração */}
            <Route path="/cadastro-empresas" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CompaniesPage />
              </DashboardLayout>
            } />

            <Route path="/produtos-producao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ProductionProductsPage />
              </DashboardLayout>
            } />

            <Route path="/materias-primas" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <RawMaterialsPage />
              </DashboardLayout>
            } />

            <Route path="/composicoes" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CompositionsPage />
              </DashboardLayout>
            } />

            <Route path="/etapas-producao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ProductionStepsPage />
              </DashboardLayout>
            } />

            <Route path="/servicos" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ServicesPage />
              </DashboardLayout>
            } />

            <Route path="/tenants" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <TenantsPage />
              </DashboardLayout>
            } />

            <Route path="/users" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <UserPage />
              </DashboardLayout>
            } />

            <Route path="/permissions" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <PermissionsPage />
              </DashboardLayout>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App
