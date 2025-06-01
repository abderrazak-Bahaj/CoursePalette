import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'course_cart_items';

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state with items from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem(CART_STORAGE_KEY);
      return storedItems ? JSON.parse(storedItems) : [];
    }
    return [];
  });

  // Update localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      if (prevItems.some((i) => i.id === item.id)) {
        return prevItems;
      }
      const newItems = [...prevItems, item];
      return newItems;
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id);
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
