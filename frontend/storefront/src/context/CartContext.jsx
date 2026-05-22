import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const CART_ID_KEY = 'aquarium_cart_id';

function getCartId() {
  return localStorage.getItem(CART_ID_KEY);
}

function setCartId(id) {
  localStorage.setItem(CART_ID_KEY, id);
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const cartId = getCartId();
    if (!cartId && !user) return;
    setLoading(true);
    try {
      const res = await cartService.getCart(cartId || undefined);
      setCart(res.data);
      if (res.data.id) setCartId(res.data.id);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartService.addItem(getCartId(), productId, quantity);
      setCart(res.data);
      if (res.data.id) setCartId(res.data.id);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const cartId = getCartId();
    if (!cartId) return;
    setLoading(true);
    try {
      const res = await cartService.updateItem(itemId, cartId, quantity);
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const cartId = getCartId();
    if (!cartId) return;
    setLoading(true);
    try {
      const res = await cartService.removeItem(itemId, cartId);
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeCart = useCallback(async () => {
    const guestId = getCartId();
    if (!guestId) return;
    try {
      const res = await cartService.mergeCart(guestId);
      setCart(res.data);
      setCartId(res.data.id);
      localStorage.removeItem(CART_ID_KEY);
    } catch {
      // guest cart might be empty or already merged
    }
  }, []);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, fetchCart, addItem, updateItem, removeItem, mergeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
