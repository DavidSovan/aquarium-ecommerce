import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    const cartId = cartService.getCartId();
    if (!cartId) return null;
    setLoading(true);
    try {
      const data = await cartService.getCart(cartId);
      setCart(data);
      setItemCount(data.total_items);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        cartService.clearCartId();
        setCart(null);
        setItemCount(0);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const data = await cartService.addItem(productId, quantity);
      setCart(data);
      setItemCount(data.total_items);
      setIsDrawerOpen(true); // Open drawer when item added
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    setLoading(true);
    try {
      const data = await cartService.updateItem(itemId, quantity);
      setCart(data);
      setItemCount(data.total_items);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    setLoading(true);
    try {
      const data = await cartService.removeItem(itemId);
      setCart(data);
      setItemCount(data.total_items);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      await cartService.clearCart();
      setCart(null);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      itemCount,
      isDrawerOpen,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      openDrawer,
      closeDrawer
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
