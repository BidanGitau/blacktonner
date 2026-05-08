import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "~/types";

export interface CatalogueItem {
  product: Product;
  quantity: number;
}

interface CatalogueStore {
  items: CatalogueItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
  has: (productId: string) => boolean;
  qtyOf: (productId: string) => number;
  count: () => number;
  subtotal: () => number;
}

export const useCatalogueStore = create<CatalogueStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      setQty: (productId, quantity) => {
        if (quantity <= 0) {
          get().remove(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clear: () => set({ items: [] }),

      has: (productId) =>
        get().items.some((i) => i.product.id === productId),

      qtyOf: (productId) =>
        get().items.find((i) => i.product.id === productId)?.quantity ?? 0,

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0,
        ),
    }),
    { name: "bt-catalogue" },
  ),
);
