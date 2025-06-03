import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* หน้าแสดงเมนูอาหาร */}
          <Route path="/" element={<MenuPage />} />
          
          {/* หน้าแสดงตะกร้าและยืนยันคำสั่ง */}
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
