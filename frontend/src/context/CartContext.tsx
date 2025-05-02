import { createContext, useState, useContext, ReactNode } from 'react';
import { BaseDesign } from '../types';

interface CartContextProps {
  cartItems: BaseDesign[];
  addToCart: (item: BaseDesign) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<BaseDesign[]>(() => {
    // Initialize cart from localStorage if available
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const addToCart = (item: BaseDesign) => {
    setCartItems((prevItems) => {
      const updatedCart = [...prevItems, item];
      localStorage.setItem('cart', JSON.stringify(updatedCart)); // Persist in localStorage
      return updatedCart;
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedCart)); // Persist in localStorage
      return updatedCart;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart)); // Persist in localStorage
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
