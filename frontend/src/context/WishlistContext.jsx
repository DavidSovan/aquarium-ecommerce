import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const fetchWishlist = useCallback(async () => {
    const wlId = wishlistService.getWishlistId();
    if (!wlId) return null;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist(wlId);
      setWishlist(data);
      setWishlistedIds(new Set(data.items.map(i => i.product_id)));
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        wishlistService.clearWishlistId();
        setWishlist(null);
        setWishlistedIds(new Set());
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addItem = useCallback(async (productId) => {
    setLoading(true);
    try {
      const data = await wishlistService.addItem(productId);
      setWishlist(data);
      setWishlistedIds(new Set(data.items.map(i => i.product_id)));
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    setLoading(true);
    try {
      const data = await wishlistService.removeItem(productId);
      setWishlist(data);
      setWishlistedIds(new Set(data.items.map(i => i.product_id)));
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleItem = useCallback(async (productId) => {
    if (wishlistedIds.has(productId)) {
      return removeItem(productId);
    } else {
      return addItem(productId);
    }
  }, [wishlistedIds, addItem, removeItem]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      wishlistedIds,
      fetchWishlist,
      addItem,
      removeItem,
      toggleItem,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
