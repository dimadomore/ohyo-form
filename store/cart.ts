import { create } from "zustand";
import type { Item } from "../components/ItemGrid";

export interface CartItem {
  item: Item;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Item) => void;
  removeItem: (id: number) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clearCart: () => void;
}

const MULTIPLIER = 20;

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.item.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.item.id === item.id
              ? { ...i, quantity: i.quantity + MULTIPLIER }
              : i,
          ),
        };
      } else {
        return { items: [...state.items, { item, quantity: MULTIPLIER }] };
      }
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.item.id !== id) })),
  increment: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.item.id === id ? { ...i, quantity: i.quantity + MULTIPLIER } : i,
      ),
    })),
  decrement: (id) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.item.id === id ? { ...i, quantity: i.quantity - MULTIPLIER } : i,
        )
        .filter((i) => i.quantity > 0),
    })),
  clearCart: () => set({ items: [] }),
}));
