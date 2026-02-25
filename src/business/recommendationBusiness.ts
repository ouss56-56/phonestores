import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/admin-types";

export const recommendationBusiness = {
    /**
     * Get products in same category with similar price
     */
    async getSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
        // Get current product details
        const { data: current } = await supabase
            .from('products')
            .select('category_id, selling_price')
            .eq('id', productId)
            .single();

        if (!current) return [];

        const minPrice = Number(current.selling_price) * 0.7;
        const maxPrice = Number(current.selling_price) * 1.3;

        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', current.category_id)
            .neq('id', productId)
            .eq('is_active', true)
            .gte('selling_price', minPrice)
            .lte('selling_price', maxPrice)
            .limit(limit);

        return (data || []) as unknown as Product[];
    },

    /**
     * Find products frequently bought with this one (analysis of order_items)
     */
    async getBoughtTogether(productId: string, limit = 4): Promise<Product[]> {
        // 1. Find orders containing this product
        const { data: ordersWithProduct } = await supabase
            .from('order_items')
            .select('order_id')
            .eq('product_id', productId)
            .limit(50); // Sample last 50 orders

        if (!ordersWithProduct || ordersWithProduct.length === 0) return [];

        const orderIds = ordersWithProduct.map(o => o.order_id);

        // 2. Find other products in those same orders
        const { data: otherItems } = await supabase
            .from('order_items')
            .select('product_id')
            .in('order_id', orderIds)
            .neq('product_id', productId);

        if (!otherItems || otherItems.length === 0) return [];

        // 3. Count occurrences
        const counts: Record<string, number> = {};
        otherItems.forEach(item => {
            counts[item.product_id] = (counts[item.product_id] || 0) + 1;
        });

        // 4. Sort and get top IDs
        const topIds = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([id]) => id);

        if (topIds.length === 0) return [];

        // 5. Fetch product details
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', topIds)
            .eq('is_active', true);

        return (products || []) as unknown as Product[];
    },

    /**
     * Get high-margin accessories for cart upsell
     */
    async getRecommendedUpsells(limit = 3): Promise<Product[]> {
        // Strategy: Fetch accessories with quantity > 0, sorted by margin or featured status
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('type', 'accessory')
            .eq('is_active', true)
            .gt('quantity', 0)
            .order('is_featured', { ascending: false })
            .limit(limit);

        return (data || []) as unknown as Product[];
    }
};
