import { supabase } from "@/integrations/supabase/client";
import type { Supplier, PurchaseOrder, POStatus } from "@/lib/admin-types";
import { auditService } from "./auditService";
import { stockService } from "./stockService";

export const suppliersService = {
    async getAll() {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Supplier[];
    },

    async create(supplier: Partial<Supplier>) {
        const { data, error } = await supabase
            .from('suppliers')
            .insert(supplier)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'create', entity: 'suppliers', entity_id: data.id, new_values: data as unknown as Record<string, unknown> });
        return data as Supplier;
    },

    async update(id: string, updates: Partial<Supplier>) {
        const { data, error } = await supabase
            .from('suppliers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'update', entity: 'suppliers', entity_id: id, new_values: updates as Record<string, unknown> });
        return data as Supplier;
    },

    async getPurchaseOrders(status?: POStatus) {
        let query = supabase
            .from('purchase_orders')
            .select('*, suppliers(name), purchase_order_items(*, products(name, sku))')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async createPO(po: { supplier_id: string; items: { product_id: string; quantity: number; unit_cost: number }[]; notes?: string }) {
        const totalAmount = po.items.reduce((sum, i) => sum + (i.unit_cost * i.quantity), 0);

        const { data: order, error } = await supabase
            .from('purchase_orders')
            .insert({
                supplier_id: po.supplier_id,
                total_amount: totalAmount,
                notes: po.notes || null,
                po_number: '',
            })
            .select()
            .single();

        if (error) throw error;

        const items = po.items.map(i => ({
            po_id: order.id,
            product_id: i.product_id,
            quantity: i.quantity,
            unit_cost: i.unit_cost,
        }));

        await supabase.from('purchase_order_items').insert(items);
        await auditService.log({ action: 'create', entity: 'purchase_orders', entity_id: order.id, new_values: { total_amount: totalAmount, items_count: items.length } });

        return order;
    },

    async receivePO(poId: string) {
        // Get PO items
        const { data: po } = await supabase
            .from('purchase_orders')
            .select('*, purchase_order_items(*, products(name))')
            .eq('id', poId)
            .single();

        if (!po) throw new Error('PO not found');

        // Update stock for each item
        for (const item of (po.purchase_order_items || [])) {
            await stockService.recordMovement({
                product_id: item.product_id,
                change: item.quantity,
                type: 'purchase',
                reference_id: poId,
                note: `PO received: ${po.po_number}`,
            });

            // Update received quantity
            await supabase
                .from('purchase_order_items')
                .update({ received_quantity: item.quantity })
                .eq('id', item.id);
        }

        // Mark PO as received
        await supabase
            .from('purchase_orders')
            .update({ status: 'received', received_at: new Date().toISOString() })
            .eq('id', poId);

        // Finance entry for purchase
        await supabase.from('finances').insert({
            type: 'purchase',
            category: 'inventory',
            amount: Number(po.total_amount),
            description: `PO ${po.po_number} received`,
            reference_id: poId,
            reference_type: 'purchase_order',
        });

        await auditService.log({ action: 'status_change', entity: 'purchase_orders', entity_id: poId, old_values: { status: po.status }, new_values: { status: 'received' } });
    }
};
