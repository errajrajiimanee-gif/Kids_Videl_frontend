import { create } from 'zustand';
import type { Product } from '../types/product';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      set({ items: items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) });
    } else {
      set({ items: [...items, { ...product, quantity }] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      set({ items: get().items.map(item => item.id === productId ? { ...item, quantity } : item) });
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
