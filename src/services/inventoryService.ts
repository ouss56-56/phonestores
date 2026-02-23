import { supabase } from "@/integrations/supabase/client";
import type { Product, RotationType, InventorySnapshot } from "@/lib/admin-types";

export const inventoryService = {
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    },

    async updateProduct(id: string, updates: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    calculateMargin(purchasePrice: number, sellingPrice: number): number {
        if (sellingPrice === 0) return 0;
        return Math.round(((sellingPrice - purchasePrice) / sellingPrice) * 100);
    },

    detectRotation(product: Product): RotationType {
        const now = new Date();
        const addedAt = new Date(product.added_at);
        const daysInStock = Math.floor((now.getTime() - addedAt.getTime()) / (1000 * 60 * 60 * 24));

        // Simple logic based on instructions: Fast-moving, Moderate, Slow-moving, Dead stock
        if (product.quantity === 0) return 'dead'; // Just for safety

        if (daysInStock < 15) return 'high';
        if (daysInStock < 30) return 'medium';
        if (daysInStock < 45) return 'slow';
        return 'dead';
    },

    async createSnapshot() {
        const products = await this.getProducts();
        const totalCapital = products.reduce((acc, p) => acc + (p.purchase_price * p.quantity), 0);
        const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);

        const distribution: Record<string, { capital: number; quantity: number }> = {};

        products.forEach(p => {
            const category = p.type || 'unknown';
            if (!distribution[category]) {
                distribution[category] = { capital: 0, quantity: 0 };
            }
            distribution[category].capital += (p.purchase_price * p.quantity);
            distribution[category].quantity += p.quantity;
        });

        const { data, error } = await supabase
            .from('inventory_snapshots')
            .insert({
                total_capital: totalCapital,
                total_items: totalItems,
                distribution: distribution
            })
            .select()
            .single();

        if (error) throw error;
        return data as InventorySnapshot;
    }
};
