import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "~/types";

export const DELIVERY_FEES: Record<string, number> = {
  "Nairobi CBD": 150,
  "Westlands": 200,
  "Kilimani": 200,
  "Karen": 350,
  "Thika": 400,
  "Mombasa Road": 300,
  "Outside Nairobi": 600,
};

interface CartStore {
  items: CartItem[];
  deliveryZone: string;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  update: (productId: string, quantity: number) => void;
  clear: () => void;
  setDeliveryZone: (zone: string) => void;
  subtotal: () => number;
  deliveryFee: () => number;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryZone: "Nairobi CBD",

      add: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
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

      update: (productId, quantity) => {
        if (quantity <= 0) {
          get().remove(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clear: () => set({ items: [] }),

      setDeliveryZone: (zone) => set({ deliveryZone: zone }),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),

      deliveryFee: () => DELIVERY_FEES[get().deliveryZone] ?? 300,

      total: () => get().subtotal() + get().deliveryFee(),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "bt-cart" }
  )
);

export const DELIVERY_ZONE_OPTIONS = Object.keys(DELIVERY_FEES);
