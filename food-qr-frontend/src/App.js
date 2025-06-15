import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import QRCodePage from './pages/QRCodePage';
import MenuDetailPage from './pages/MenuDetailPage';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/menu/:id" element={<MenuDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/qr" element={<QRCodePage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
