import { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PrivateRoute from "./routes/PrivateRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import ReferenciaisLayout from "./layouts/ReferenceLayout";
import PrincipaisLayout from "./layouts/MainLayout";
import ComerciaisLayout from "./layouts/CommercialLayout";

import Dashboard from "./pages/Dashboard";
import LoginPage from "./LoginPage";

import GroupPage from "./pages/groups/GroupPage";
import FiscalCodePage from "./pages/fiscalCodes/FiscalCodePage";
import TaxSituationPage from "./pages/taxSituations/TaxSituationPage";
import PaymentMethodPage from "./pages/paymentMethods/PaymentMethodPage";
import HistoryPage from "./pages/histories/HistoryPage";
import NotePage from "./pages/notes/NotePage";



import ActivityPage from "./pages/activities/ActivityPage";
import CurrencyPage from "./pages/currencies/CurrencyPage";
import SizePage from "./pages/sizes/SizePage";
import ColorPage from "./pages/colors/ColorPage";


import CustomerPage from "./pages/customers/CustomerPage";
import SupplierPage from "./pages/suppliers/SupplierPage";
import CompanyPage from "./pages/companies/CompanyPage";
import FormProductCategoryPage from "./pages/productAccessories/FormProductCategoryPage";
import ProductPage from "./pages/products/ProductPage";
import ServicePage from "./pages/services/ServicePage";
import TransportadorPage from "./pages/transportadores/FormTransportadorPage";
import RawMaterialPage from "./pages/rawMaterials/RawMaterialPage";

import FormCompositionPage from "./pages/compositions/FormCompositionPage";
import FormProductAccessoryTabs from "./pages/productAccessories/FormProductAccessoryTabs";
import ProductManagementPage from "./pages/products/ProductManagementPage";
import StockManagementGridPage from "./pages/stock/StockManagementGridPage";

import { verificarExpiracaoToken } from "./service/auth";
import FormPurchasePage from "./pages/purchases/FormPurchasePage";
import OrderPage from "./pages/orders/OrderPage";
import FormSalesPersonPage from "./pages/salesPersons/FormSalesPersonPage";
import StockEntryPage from "./pages/stock/StockEntryPage";
import TestPrincipalNamespace from "./components/TestMainNamespace";

// Sale pages
import SaleListPage from "./pages/sales/SaleListPage";
import SaleFormPage from "./pages/sales/SaleFormPage";
import SaleDetailsPage from "./pages/sales/SaleDetailsPage";

import { AuthProvider } from "./contexts/AuthContext";

function App({ user }: { user?: { language?: string } }) {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (user?.language) {
      const userLanguage = user.language;
      i18n.changeLanguage(userLanguage);
    }
  }, [user?.language]);

  return (
    <AuthProvider>
      <div className="app-container">
        <Suspense fallback={<div>{t("common.loading", "Loading...")}</div>}>
          <Routes>
            {/* Público */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>

            {/* Rota de teste para o namespace principal */}
            <Route path="/test-principal" element={<TestPrincipalNamespace />} />

            {/* Referenciais */}
            <Route
              path="/referenciais/*"
              element={
                <PrivateRoute>
                  <ReferenciaisLayout />
                </PrivateRoute>
              }
            >
              <Route
                index
                element={<div>{t("referentials.welcome", "Welcome to Referentials")}</div>}
              />
              <Route path="groups" element={<GroupPage />} />
              <Route path="fiscal-codes" element={<FiscalCodePage />} />
              <Route path="tax-situations" element={<TaxSituationPage />} />
              <Route path="tamanhos" element={<SizePage />} />
              <Route path="cores" element={<ColorPage />} />
              <Route path="payment-methods" element={<PaymentMethodPage />} />
              <Route path="histories" element={<HistoryPage />} />
              <Route path="notes" element={<NotePage />} />
              <Route path="activities" element={<ActivityPage />} />
              <Route path="currencies" element={<CurrencyPage />} />
              <Route path="produtos-categorias" element={<FormProductAccessoryTabs />} />
            </Route>

            {/* Principais */}
            <Route
              path="/principais/*"
              element={
                <PrivateRoute>
                  <PrincipaisLayout />
                </PrivateRoute>
              }
            >
              <Route
                index
                element={<div>{t("principal.welcome", "Welcome to Principal Registers")}</div>}
              />
              <Route path="customers" element={<CustomerPage />} />
              <Route path="suppliers" element={<SupplierPage />} />
              <Route path="product-categories" element={<FormProductCategoryPage />} />
              <Route path="products" element={<ProductPage />} />
              <Route path="product-management" element={<ProductManagementPage />} />
              <Route path="stock-management" element={<StockManagementGridPage />} />
              <Route path="companies" element={<CompanyPage />} />
              <Route path="services" element={<ServicePage />} />
              <Route path="transportadores" element={<TransportadorPage />} />
              <Route path="raw-materials" element={<RawMaterialPage />} />
              <Route path="compositions" element={<FormCompositionPage />} />
            </Route>

            {/* Comerciais (ComerciaisSidebar vive dentro do layout) */}
            <Route
              path="/comerciais/*"
              element={
                <PrivateRoute>
                  <ComerciaisLayout />
                </PrivateRoute>
              }
            >
              <Route
                index
                element={<div>{t("commercial.welcome", "Welcome to Commercial Registers")}</div>}
              />
              <Route path="sellers" element={<FormSalesPersonPage />} />
              <Route path="stock-entry" element={<StockEntryPage />} />
              <Route path="reajustes" element={<div>Página de Reajustes</div>} />
              <Route path="purchases" element={<FormPurchasePage />} />
              <Route path="orders" element={<OrderPage />} />
              <Route path="sales" element={<SaleListPage />} />
              <Route path="sales/new" element={<SaleFormPage />} />
              <Route path="sales/:id" element={<SaleDetailsPage />} />
              <Route path="sales/:id/edit" element={<SaleFormPage />} />
              <Route path="formas-cupom" element={<div>Página de Formas de Cupom</div>} />
              <Route path="fechamento-diario" element={<div>Página de Fechamento Diário</div>} />
              <Route path="transferencia-interna" element={<div>Página de Transferência Interna</div>} />
              <Route path="transferencia-externa" element={<div>Página de Transferência Externa</div>} />
            </Route>

            {/* Financeiros (FinanceirosSidebar vive dentro do layout) */}
            <Route
              path="/financeiros/*"
              element={
                <PrivateRoute>

                </PrivateRoute>
              }
            >
              <Route
                index
                element={<div>{t("financial.welcome", "Welcome to Financial Registers")}</div>}
              />


            </Route>
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;

//common.loading

//referentials.welcome

//principal.welcome

//commercial.welcome

//financial.welcome
