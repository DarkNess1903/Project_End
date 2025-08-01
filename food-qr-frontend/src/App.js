import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

import CashierLayout from './layouts/CashierLayout';
import TableManagementPage from './pages/cashier/TableManagementPage';
import MenuPromoManagement from './pages/cashier/MenuPromoManagement';
import OrderListPage from './pages/cashier/OrderListPage';
import ReportPage from './pages/cashier/ReportPage';
import SettingsPage from './pages/cashier/SettingsPage';
import PaymentPage from './pages/cashier/PaymentPage';
import ExpensePage from './pages/cashier/ExpensePage';

import MenuPage from './pages/MenuPage';
import MenuDetailPage from './pages/MenuDetailPage';
import CartPage from './pages/CartPage';
import QRCodePage from './pages/QRCodePage';
import BillPage from './pages/BillPage';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* ฝั่งลูกค้า */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/menu/:id" element={<MenuDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/bill" element={<BillPage />} />

          {/* ฝั่งพนักงานแคชเชียร์ */}
          <Route path="/cashier" element={<CashierLayout />}>
            <Route path="tables" element={<TableManagementPage />} />
            <Route path="menu" element={<MenuPromoManagement />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="expensePage" element={<ExpensePage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="qrcode" element={<QRCodePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="payment/:orderId" element={<PaymentPage />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
