import { create } from 'zustand';
import type { Product } from '../types/product';

interface FavoritesState {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (product) => {
    const { favorites } = get();
    if (!favorites.find(p => p.id === product.id)) {
      set({ favorites: [...favorites, product] });
    }
  },

  removeFavorite: (productId) => {
    set({ favorites: get().favorites.filter(p => p.id !== productId) });
  },

  isFavorite: (productId) => {
    return !!get().favorites.find(p => p.id === productId);
  },
}));
