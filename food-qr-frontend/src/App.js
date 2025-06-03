import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import QRCodePage from './pages/QRCodePage';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/qr" element={<QRCodePage />} />  // ✅ เพิ่มบรรทัดนี้
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
