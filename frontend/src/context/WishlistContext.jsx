import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const API_URL = 'http://localhost:5005/api/wishlist';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setWishlist(response.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Could not fetch wishlist items');
    } finally {
      setLoading(false);
    }
  };

  // Sync wishlist when user logs in/out
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) return { success: false, error: 'Please log in to add items to your wishlist' };
    
    // Optimistic update
    const optimisticItem = { productId, userId: user.id, id: 'temp-' + Date.now() };
    setWishlist((prev) => [optimisticItem, ...prev]);
    
    try {
      setError(null);
      const response = await axios.post(API_URL, { productId });
      // Replace optimistic item with actual from server
      setWishlist((prev) => prev.map(item => item.id === optimisticItem.id ? response.data : item));
      return { success: true };
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      // Revert optimistic update
      setWishlist((prev) => prev.filter(item => item.id !== optimisticItem.id));
      const msg = err.response?.data?.message || 'Could not add item to wishlist';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return { success: false };
    
    // Optimistic update
    const previousWishlist = [...wishlist];
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    
    try {
      setError(null);
      await axios.delete(`${API_URL}/${productId}`);
      return { success: true };
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      // Revert optimistic update
      setWishlist(previousWishlist);
      const msg = err.response?.data?.message || 'Could not remove item from wishlist';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) return { success: false, error: 'Auth required' };
    const exists = wishlist.some((item) => item.productId === productId);
    if (exists) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
