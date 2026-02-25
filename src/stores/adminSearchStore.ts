// ============================================================
// Admin Search Store (Zustand)
// Global search across products, orders, and customers
// ============================================================
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
    id: string;
    type: 'product' | 'order' | 'customer';
    title: string;
    subtitle: string;
    link: string; // Tab name to navigate to
}

interface AdminSearchState {
    searchQuery: string;
    results: {
        products: any[];
        orders: any[];
        customers: any[];
    };
    isLoading: boolean;
    isOpen: boolean;

    // Actions
    setSearchQuery: (query: string) => void;
    performSearch: (query: string) => Promise<void>;
    clearResults: () => void;
    setIsOpen: (open: boolean) => void;
}

export const useAdminSearchStore = create<AdminSearchState>()((set) => ({
    searchQuery: '',
    results: { products: [], orders: [], customers: [] },
    isLoading: false,
    isOpen: false,

    setSearchQuery: (query) => set({ searchQuery: query }),

    performSearch: async (query) => {
        if (!query || query.length < 2) {
            set({ results: { products: [], orders: [], customers: [] }, isLoading: false });
            return;
        }

        set({ isLoading: true });

        try {
            const [productsRes, ordersRes, customersRes] = await Promise.all([
                supabase.from('products').select('*').or(`name.ilike.%${query}%,sku.ilike.%${query}%`).limit(5),
                supabase.from('orders').select('*').or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%`).limit(5),
                supabase.from('customers').select('*').or(`name.ilike.%${query}%,phone.ilike.%${query}%`).limit(5)
            ]);

            set({
                results: {
                    products: productsRes.data || [],
                    orders: ordersRes.data || [],
                    customers: customersRes.data || []
                },
                isLoading: false
            });
        } catch (error) {
            console.error('Search error:', error);
            set({ isLoading: false });
        }
    },

    clearResults: () => set({ searchQuery: '', results: { products: [], orders: [], customers: [] }, isOpen: false }),

    setIsOpen: (open) => set({ isOpen: open }),
}));
