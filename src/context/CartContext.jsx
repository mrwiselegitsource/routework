import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';
import { db } from '../lib/db';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { session, profile } = useCustomerAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!profile?.id) {
      setCart({ items: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const cartData = await db.getCart(profile.id);
      
      // We also need the actual order details for each item to show pricing and previews.
      // In a real app, this might be a JOIN query, but here we'll map and fetch.
      const enrichedItems = await Promise.all(
        (cartData.items || []).map(async (item) => {
          const order = await db.getPublicOrder(item.order_id);
          const media = await db.getOrderMedia(item.order_id);
          return {
            ...item,
            order,
            media: media[0] || null
          };
        })
      );
      
      setCart({ ...cartData, items: enrichedItems });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [profile?.id]);

  const addToCart = async (orderId) => {
    if (!profile?.id) throw new Error('Must be logged in to add to cart.');
    
    // Check if already in cart
    if (cart.items.some(i => i.order_id === orderId)) {
      return; // Already added
    }
    
    await db.addToCart(profile.id, orderId);
    await fetchCart();
  };

  const removeFromCart = async (orderId) => {
    if (!profile?.id) return;
    await db.removeFromCart(profile.id, orderId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!profile?.id) return;
    await db.clearCart(profile.id);
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
