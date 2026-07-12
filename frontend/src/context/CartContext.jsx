import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const API_URL = 'http://localhost:5005/api/cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCart(response.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Could not fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when user logs in/out
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setError(null);
      const response = await axios.post(API_URL, { productId, quantity });
      
      // Update local state instead of refetching the entire cart
      setCart(prevCart => {
        const existing = prevCart.find(item => item.productId === productId);
        if (existing) {
          return prevCart.map(item => item.productId === productId ? response.data : item);
        }
        return [...prevCart, response.data];
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Could not add item to cart';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const previousCart = [...cart];
    
    // Optimistic update
    setCart(prevCart => 
      prevCart.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    
    try {
      setError(null);
      await axios.put(`${API_URL}/${productId}`, { quantity });
      return { success: true };
    } catch (err) {
      console.error('Error updating quantity:', err);
      // Revert on error
      setCart(previousCart);
      const msg = err.response?.data?.message || 'Could not update quantity';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const removeFromCart = async (productId) => {
    const previousCart = [...cart];
    
    // Optimistic update
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    
    try {
      setError(null);
      await axios.delete(`${API_URL}/${productId}`);
      return { success: true };
    } catch (err) {
      console.error('Error removing from cart:', err);
      // Revert on error
      setCart(previousCart);
      const msg = err.response?.data?.message || 'Could not remove item from cart';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, error, addToCart, updateQuantity, removeFromCart, fetchCart }}>
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
