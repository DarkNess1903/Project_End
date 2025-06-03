import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToCart = (menuItem) => {
    setItems(prev => {
      const exist = prev.find(item => item.MenuID === menuItem.MenuID);
      if (exist) {
        return prev.map(item =>
          item.MenuID === menuItem.MenuID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId) => {
    setItems(prev => prev.filter(item => item.MenuID !== menuId));
  };

  // เพิ่มฟังก์ชันแก้ไขจำนวน
  const updateQuantity = (menuId, newQuantity) => {
    setItems(prev => {
      if (newQuantity <= 0) {
        // ถ้าจำนวน 0 หรือน้อยกว่า ลบรายการนั้นออก
        return prev.filter(item => item.MenuID !== menuId);
      }
      return prev.map(item =>
        item.MenuID === menuId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => setItems([]);

  // คำนวณยอดรวม (optional)
  const totalAmount = items.reduce((sum, item) => sum + item.Price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
