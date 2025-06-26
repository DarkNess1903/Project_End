import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CashierLayout from './layouts/CashierLayout';
import TableManagementPage from './pages/cashier/TableManagementPage';
import MenuPromoManagement from './pages/cashier/MenuPromoManagement';
import OrderListPage from './pages/cashier/OrderListPage';
import ReportPage from './pages/cashier/ReportPage';
import SettingsPage from './pages/cashier/SettingsPage';

import MenuPage from './pages/MenuPage';
import MenuDetailPage from './pages/MenuDetailPage';
import CartPage from './pages/CartPage';
import QRCodePage from './pages/QRCodePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ฝั่งลูกค้า */}
        <Route path="/" element={<MenuPage />} />
        <Route path="/menu/:id" element={<MenuDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* ฝั่งพนักงานแคชเชียร์ */}
        <Route path="/cashier" element={<CashierLayout />}>
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="menu" element={<MenuPromoManagement />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="qrcode" element={<QRCodePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
