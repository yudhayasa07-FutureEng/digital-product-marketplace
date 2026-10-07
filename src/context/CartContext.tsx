'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const { success } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dh_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dh_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (product: Product) => {
    if (items.some((i) => i.id === product.id)) {
      return;
    }
    setItems((prev) => [...prev, product]);
    success(`"${product.name}" ditambahkan ke keranjang`);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: string) => items.some((i) => i.id === productId);

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalAmount,
      }}
    >
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
