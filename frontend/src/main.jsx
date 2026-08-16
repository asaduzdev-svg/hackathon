import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layout/RootLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import AuthLayout from './pages/AuthLayout.jsx'
import OrdersList from './pages/orders/OrdersList.jsx'
import OrderDetail from './pages/orders/OrderDetail.jsx'
import CreateOrder from './pages/orders/CreateOrder.jsx'
import CustomersList from './pages/customers/CustomersList.jsx'
import CustomerDetail from './pages/customers/CustomerDetail.jsx'
import Payments from './pages/payments/Payments.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                  </Route>
                  <Route element={<RootLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/orders" element={<OrdersList />} />
                    <Route path="/orders/new" element={<CreateOrder />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/customers" element={<CustomersList />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
