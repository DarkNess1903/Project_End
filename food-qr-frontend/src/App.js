import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

import CashierLayout from './layouts/CashierLayout';
import TableManagementPage from './pages/cashier/TableManagementPage';
import MenuPromoManagement from './pages/cashier/MenuPromoManagement';
import OrderListPage from './pages/cashier/OrderListPage';
import ReportPage from './pages/cashier/ReportPage';
import SettingsPage from './pages/cashier/SettingsPage';
import PaymentPage from './pages/cashier/PaymentPage';
import ExpensePage from './pages/cashier/ExpensePage';
import PaymentSlipsPage from './pages/cashier/PaymentSlipsPage';

import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import QRCodePage from './pages/QRCodePage';
import BillPage from './pages/BillPage';
import FeedbackForm from './pages/FeedbackForm';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* ฝั่งลูกค้า */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/bill" element={<BillPage />} />
          <Route path="/feedback/:orderId" element={<FeedbackForm />} />

          {/* Login ฝั่งพนักงาน */}
          <Route path="/login" element={<LoginPage />} />

          {/* ฝั่งพนักงานแคชเชียร์ (Protected) */}
          <Route
            path="/cashier"
            element={
              <ProtectedRoute>
                <CashierLayout />
              </ProtectedRoute>
            }
          >
            <Route path="tables" element={<TableManagementPage />} />
            <Route path="menu" element={<MenuPromoManagement />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="expensePage" element={<ExpensePage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="slipsPage" element={<PaymentSlipsPage />} />
            <Route path="qrcode" element={<QRCodePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="payment/:orderId" element={<PaymentPage />} />
          </Route>

          {/* default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
