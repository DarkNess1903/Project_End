import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.MenuID === item.MenuID);
      if (existingItem) {
        return prevItems.map(i =>
          i.MenuID === item.MenuID
            ? { ...i, quantity: i.quantity + item.quantity, note: item.note || i.note }
            : i
        );
      } else {
        return [...prevItems, { ...item, quantity: item.quantity }];
      }
    });
  };

  const removeFromCart = (menuId) => {
    setItems(prev => prev.filter(item => item.MenuID !== menuId));
  };

  const updateQuantity = (menuId, newQuantity) => {
    setItems(prev => {
      if (newQuantity <= 0) {
        return prev.filter(item => item.MenuID !== menuId);
      }
      return prev.map(item =>
        item.MenuID === menuId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => setItems([]);

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
