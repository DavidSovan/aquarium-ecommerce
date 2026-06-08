import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const WISHLIST_ID_KEY = 'fashion_wishlist_id';

function getWishlistId() {
  return localStorage.getItem(WISHLIST_ID_KEY);
}

function setWishlistId(id) {
  localStorage.setItem(WISHLIST_ID_KEY, id);
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    const wlId = getWishlistId();
    if (!wlId && !user) return;
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist(wlId || undefined);
      setWishlist(res.data);
      if (res.data.id) setWishlistId(res.data.id);
    } catch {
      setWishlist(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addItem = useCallback(async (productId) => {
    setLoading(true);
    try {
      const res = await wishlistService.addItem(getWishlistId(), productId);
      setWishlist(res.data);
      if (res.data.id) setWishlistId(res.data.id);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    const wlId = getWishlistId();
    if (!wlId) return;
    setLoading(true);
    try {
      const res = await wishlistService.removeItem(productId, wlId);
      setWishlist(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlist?.items?.some(i => i.product_id === productId) || false;
  }, [wishlist]);

  const mergeWishlist = useCallback(async () => {
    const guestId = getWishlistId();
    if (!guestId) return;
    try {
      const res = await wishlistService.mergeWishlist(guestId);
      setWishlist(res.data);
      setWishlistId(res.data.id);
    } catch {
      // guest wishlist might be empty
    }
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, fetchWishlist, addItem, removeItem, isInWishlist, mergeWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
