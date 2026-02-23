import { supabase } from "@/integrations/supabase/client";
import type { StockMovement, StockMovementType } from "@/lib/admin-types";
import { auditService } from "./auditService";

export const stockService = {
    async recordMovement(params: {
        product_id: string;
        change: number;
        type: StockMovementType;
        reference_id?: string;
        note?: string;
    }) {
        const { data: { user } } = await supabase.auth.getUser();

        // Insert movement record
        const { data, error } = await supabase
            .from('stock_movements')
            .insert({
                product_id: params.product_id,
                change: params.change,
                type: params.type,
                reference_id: params.reference_id || null,
                user_id: user?.id || null,
                note: params.note || null,
            })
            .select()
            .single();

        if (error) throw error;

        // Update product quantity
        const { data: product } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', params.product_id)
            .single();

        if (product) {
            const newQty = Math.max(0, product.quantity + params.change);
            await supabase
                .from('products')
                .update({ quantity: newQty })
                .eq('id', params.product_id);
        }

        return data as StockMovement;
    },

    async getMovements(productId?: string, limit = 100) {
        let query = supabase
            .from('stock_movements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (productId) {
            query = query.eq('product_id', productId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as StockMovement[];
    },

    async getLowStockProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('quantity', { ascending: true })
            .limit(50);

        if (error) throw error;
        // Filter client-side since Supabase doesn't support column-to-column comparison easily
        return (data || []).filter(p => p.quantity <= p.low_stock_threshold);
    },

    async performInventoryCount(counts: { product_id: string; actual_count: number }[]) {
        const variances: { product_id: string; product_name: string; expected: number; actual: number; diff: number }[] = [];

        for (const { product_id, actual_count } of counts) {
            const { data: product } = await supabase
                .from('products')
                .select('id, name, quantity')
                .eq('id', product_id)
                .single();

            if (!product) continue;

            const diff = actual_count - product.quantity;
            variances.push({
                product_id: product.id,
                product_name: product.name,
                expected: product.quantity,
                actual: actual_count,
                diff,
            });

            if (diff !== 0) {
                await this.recordMovement({
                    product_id,
                    change: diff,
                    type: 'adjustment',
                    note: `Inventory count adjustment: expected ${product.quantity}, counted ${actual_count}`,
                });

                await auditService.log({
                    action: 'update',
                    entity: 'inventory_count',
                    entity_id: product_id,
                    old_values: { quantity: product.quantity },
                    new_values: { quantity: actual_count, variance: diff },
                });
            }
        }

        return variances;
    },

    async createSnapshot() {
        const { data: products } = await supabase
            .from('products')
            .select('type, purchase_price, quantity')
            .eq('is_active', true);

        if (!products) return null;

        const totalCapital = products.reduce((acc, p) => acc + (Number(p.purchase_price) * p.quantity), 0);
        const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);

        const distribution: Record<string, { capital: number; quantity: number }> = {};
        products.forEach(p => {
            const cat = p.type || 'unknown';
            if (!distribution[cat]) distribution[cat] = { capital: 0, quantity: 0 };
            distribution[cat].capital += (Number(p.purchase_price) * p.quantity);
            distribution[cat].quantity += p.quantity;
        });

        const { data, error } = await supabase
            .from('inventory_snapshots')
            .insert({
                total_capital: totalCapital,
                total_items: totalItems,
                distribution: distribution,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
