import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './components/Dashboard'
import TenantPage from './pages/TenantPage'
import UserPage from './pages/UserPage'
import PermissionsPage from './pages/PermissionsPage'
import { BankAccountPage } from './components/BankAccount'
import AdminRoute from './components/AdminRoute'
import AccountsPayablePage from './pages/AccountsPayablePage'
import AccountsReceivablePage from './pages/AccountsReceivablePage'
import CashFlowPage from './pages/CashFlowPage'
import { CashMovementPage } from './pages/CashMovementPage'
import FinancialCategoriesPage from './pages/FinancialCategoriesPage'
import ReconciliationPage from './pages/ReconciliationPage'
import ReportsPage from './pages/ReportsPage'
import CostCentersPage from './pages/CostCentersPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import CustomersPage from './pages/CustomersPage'
import LedgerAccountsPage from './pages/LedgerAccountsPage'
import LedgerEntriesPage from './pages/LedgerEntriesPage'
import TaxesPage from './pages/TaxesPage'
import TaxTransactionsPage from './pages/TaxTransactionsPage'
import InvoicesPage from './pages/InvoicesPage'
import CompanyPage from './pages/CompanyPage'
import TransferPage from './pages/TransferPage'
import DailyClosurePage from './pages/DailyClosurePage'
import { authService, type LoginCredentials } from './services/authService'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>('')
  const [user, setUser] = useState(authService.getUser())

  useEffect(() => {
    console.log('🚀 App.tsx - useEffect iniciado');

    const checkAuth = async () => {
      console.log('🔍 App.tsx - Verificando autenticação...');

      const token = authService.getToken();
      console.log('🔍 App.tsx - Token no localStorage:', token ? 'Existe' : 'Não existe');

      if (token) {
        console.log('🔍 App.tsx - Token encontrado, verificando validade...');
        try {
          const isAuth = authService.isAuthenticated();
          console.log('🔍 App.tsx - Token válido:', isAuth);

          if (isAuth) {
            const user = authService.getUser();
            console.log('🔍 App.tsx - Usuário recuperado:', user);
            setUser(user);
            setIsAuthenticated(true);
          } else {
            console.log('⚠️ App.tsx - Token inválido, fazendo logout');
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('❌ App.tsx - Erro ao verificar token:', error);
          authService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('ℹ️ App.tsx - Nenhum token encontrado');
        setIsAuthenticated(false);
        setUser(null);
      }

      setIsLoading(false);
      console.log('✅ App.tsx - Verificação de autenticação concluída');
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
            <Route path="/tenants" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <TenantPage />
              </DashboardLayout>
            } />
            <Route path="/users" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <UserPage />
              </DashboardLayout>
            } />
            <Route path="/permissions" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <AdminRoute>
                  <PermissionsPage />
                </AdminRoute>
              </DashboardLayout>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Financial Module Routes */}
            <Route path="/contas-pagar" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <AccountsPayablePage />
              </DashboardLayout>
            } />
            <Route path="/contas-receber" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <AccountsReceivablePage />
              </DashboardLayout>
            } />
            <Route path="/fluxo-caixa" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CashFlowPage />
              </DashboardLayout>
            } />
            <Route path="/categorias-financeiras" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <FinancialCategoriesPage />
              </DashboardLayout>
            } />
            <Route path="/conciliacao" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ReconciliationPage />
              </DashboardLayout>
            } />
            <Route path="/relatorios" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <ReportsPage />
              </DashboardLayout>
            } />
            <Route path="/bank-accounts" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <BankAccountPage />
              </DashboardLayout>
            } />

            {/* Cost Centers */}
            <Route path="/centros-custo" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CostCentersPage />
              </DashboardLayout>
            } />

            {/* Payment Methods */}
            <Route path="/metodos-pagamento" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <PaymentMethodsPage />
              </DashboardLayout>
            } />

            {/* Customers */}
            <Route path="/clientes" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CustomersPage />
              </DashboardLayout>
            } />

            {/* Accounting Module Routes */}
            <Route path="/plano-contas" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <LedgerAccountsPage />
              </DashboardLayout>
            } />
            <Route path="/lancamentos-contabeis" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <LedgerEntriesPage />
              </DashboardLayout>
            } />

            {/* Fiscal Module Routes */}
            {/* Configuração de Impostos (TaxTypes) */}
            <Route path="/configuracao-impostos" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <TaxesPage />
              </DashboardLayout>
            } />
            {/* Manter rota antiga para compatibilidade */}
            <Route path="/impostos" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <TaxesPage />
              </DashboardLayout>
            } />


            {/* Tax Transactions (Impostos a Pagar) */}
            <Route path="/impostos-pagar" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <TaxTransactionsPage />
              </DashboardLayout>
            } />


            <Route path="/notas-fiscais" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <InvoicesPage />
              </DashboardLayout>
            } />

            {/* Companies Route */}
            <Route path="/empresas" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CompanyPage />
              </DashboardLayout>
            } />

            {/* Cash Movement Route */}
            <Route path="/movimentos-caixa" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <CashMovementPage />
              </DashboardLayout>
            } />
            <Route path="/transferencias" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <TransferPage />
              </DashboardLayout>
            } />
            <Route path="/pdv" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <div className="page-placeholder">💳 PDV / POS - Em desenvolvimento</div>
              </DashboardLayout>
            } />
            <Route path="/fechamento-diario" element={
              <DashboardLayout user={user || undefined} onLogout={handleLogout}>
                <DailyClosurePage />
              </DashboardLayout>
            } />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App
