import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  type: "service" | "product";
  price: number;
  quantity: number;
  staffName?: string;
  details?: string;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  promoCode: string | null;
  discount: number;
  paymentMethod: string;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCustomer: (id: string, name: string) => void;
  setPromoCode: (code: string | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: (rate: number) => number;
  getTotal: (taxRate: number) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  customerName: null,
  promoCode: null,
  discount: 0,
  paymentMethod: "card",

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setPromoCode: (code) => set({ promoCode: code }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  clearCart: () =>
    set({
      items: [],
      customerId: null,
      customerName: null,
      promoCode: null,
      discount: 0,
      paymentMethod: "card",
    }),

  getSubtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getTax: (rate) => get().getSubtotal() * (rate / 100),

  getTotal: (taxRate) => {
    const subtotal = get().getSubtotal();
    const tax = subtotal * (taxRate / 100);
    return subtotal + tax - get().discount;
  },
}));
