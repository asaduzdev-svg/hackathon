import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layout/RootLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AuthLayout from './pages/AuthLayout.jsx'
import WorkerPage from './pages/WorkerPage.jsx'
import ConsumerPage from './pages/ConsumerPage.jsx'
import Cars from './pages/cars/Cars.jsx'
import WorkersList from './pages/workers/WorkersList.jsx'
import OrdersList from './pages/orders/OrdersList.jsx'
import OrderDetail from './pages/orders/OrderDetail.jsx'
import CreateOrder from './pages/orders/CreateOrder.jsx'
import CustomersList from './pages/customers/CustomersList.jsx'
import CustomerDetail from './pages/customers/CustomerDetail.jsx'
import Payments from './pages/Payments.jsx'
import Inventory from './pages/Inventory.jsx'
import Settings from './pages/Settings.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { homeForRole } from './utils/roles.js'
import './index.css'

function RoleHome() {
  const { user } = useAuth()
  return <Navigate to={homeForRole(user?.role)} replace />
}

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
                    <Route path="/register" element={<Register />} />
                  </Route>
                  <Route element={<RootLayout />}>
                    <Route index element={<RoleHome />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/worker" element={<WorkerPage />} />
                    <Route path="/consumer" element={<ConsumerPage />} />
                    <Route path="/cars" element={<Cars />} />
                    <Route path="/workers" element={<WorkersList />} />
                    <Route path="/orders" element={<OrdersList />} />
                    <Route path="/orders/new" element={<CreateOrder />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/customers" element={<CustomersList />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<RoleHome />} />
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
