import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (menuItem) => {
    setItems(prev => {
      const exist = prev.find(item => item.MenuID === menuItem.MenuID);
      if (exist) {
        // ถ้ามีอยู่แล้ว เพิ่มจำนวนขึ้น 1
        return prev.map(item =>
          item.MenuID === menuItem.MenuID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // ถ้าไม่มี เพิ่มใหม่จำนวน 1
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId) => {
    setItems(prev => prev.filter(item => item.MenuID !== menuId));
  };

  // ฟังก์ชันแก้ไขจำนวนในตะกร้า
  const updateQuantity = (menuId, newQuantity) => {
    setItems(prev => {
      if (newQuantity <= 0) {
        // ลบถ้าจำนวน 0 หรือน้อยกว่า
        return prev.filter(item => item.MenuID !== menuId);
      }
      // อัพเดตจำนวนใหม่
      return prev.map(item =>
        item.MenuID === menuId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => setItems([]);

  // คำนวณยอดรวมในตะกร้า (optional)
  const totalAmount = items.reduce((sum, item) => sum + item.Price * item.quantity, 0);

  const updateNote = (menuId, note) => {
  setItems(prev =>
    prev.map(item =>
      item.MenuID === menuId ? { ...item, note } : item
    )
  );
};

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNote,
      clearCart,
      totalAmount,
      totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};
