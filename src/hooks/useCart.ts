import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem } from "@/types";

// Extended cart item with product name for display
export interface CartItemWithName extends CartItem {
  productName?: string;
}

interface CartStore {
  items: CartItemWithName[];
  addItem: (item: CartItemWithName) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + newItem.quantity, updatedAt: new Date().toISOString() }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity, updatedAt: new Date().toISOString() } : i
          ),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: "ivyshop-cart" }
  )
);
