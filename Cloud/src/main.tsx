import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { WholesaleCartProvider } from './contexts/WholesaleCartContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Toast from './components/common/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WholesaleCartProvider>
          <NotificationProvider>
            <App />
            <Toast />
          </NotificationProvider>
        </WholesaleCartProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
