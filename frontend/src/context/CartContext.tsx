import { createContext, useState, useContext, ReactNode } from 'react';
import { Item } from '../model/Item.schema';

type CartItem = Item & { quantity: number };

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (item: Item) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCart = localStorage.getItem('cart');
    try {
      const parsed = storedCart ? JSON.parse(storedCart) : [];
      return parsed.map((item: any) => ({
        ...item,
        quantity: item.quantity ?? 1,
        images: Array.isArray(item.images) ? item.images : [],
      })) as CartItem[];
    } catch {
      return [];
    }
  });

  const saveToLocalStorage = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (item: Item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem._id === item._id);
      let updatedCart;

      if (existingItem) {
        updatedCart = prevItems.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        updatedCart = [...prevItems, { ...item, quantity: 1 }];
      }

      saveToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.filter(item => item._id !== id);
      saveToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prevItems) => {
      const updatedCart = prevItems.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(quantity, 1) }
          : item
      );
      saveToLocalStorage(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.setItem("cart", JSON.stringify([]));
    } catch {}
  };

  return (
    <CartContext.Provider 
    value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart
      }}>
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
