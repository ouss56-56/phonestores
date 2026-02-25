// ============================================================
// Cart Store (Zustand)
// Replaces useCart Context with Zustand + localStorage persist
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    image_url: string | null;
    color?: string | null;
    storage_capacity?: string | null;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    setIsOpen: (open: boolean) => void;

    // Computed (via getters)
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                            ),
                            isOpen: true,
                        };
                    }
                    return {
                        items: [...state.items, { ...item, quantity: 1 }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    set((state) => ({
                        items: state.items.filter((i) => i.id !== id),
                    }));
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            setIsOpen: (open) => set({ isOpen: open }),

            getTotalItems: () => {
                return get().items.reduce((sum, i) => sum + i.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (sum, i) => sum + i.price * i.quantity,
                    0
                );
            },
        }),
        {
            name: 'ps-cart',
            partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
        }
    )
);
