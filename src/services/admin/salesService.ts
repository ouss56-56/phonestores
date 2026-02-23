import { supabase } from "@/integrations/supabase/client";
import type { Sale, OrderStatus, OrderStatusLog } from "@/lib/admin-types";
import { auditService } from "./auditService";
import { stockService } from "./stockService";

export const salesService = {
    async getOrders(status?: OrderStatus, limit = 100) {
        let query = supabase
            .from('orders')
            .select('*, order_items(*, products(name, sku, brand))')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getOrderById(id: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name, sku, brand, image_url))')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createPOSSale(params: {
        customer_name: string;
        customer_phone?: string;
        items: { product_id: string; quantity: number; unit_price: number; imei_id?: string }[];
        payment_method: string;
        discount_amount?: number;
        notes?: string;
    }) {
        const totalAmount = params.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        const posRef = 'POS-' + Date.now().toString(36).toUpperCase();

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: params.customer_name,
                customer_phone: params.customer_phone || null,
                total_amount: totalAmount - (params.discount_amount || 0),
                discount_amount: params.discount_amount || 0,
                payment_method: params.payment_method,
                is_pos_sale: true,
                pos_reference: posRef,
                status: 'delivered',
                notes: params.notes || null,
                order_number: posRef,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = params.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            imei_id: item.imei_id || null,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // Deduct stock for each item
        for (const item of params.items) {
            await stockService.recordMovement({
                product_id: item.product_id,
                change: -item.quantity,
                type: 'sale',
                reference_id: order.id,
                note: `POS Sale ${posRef}`,
            });

            // Mark IMEI as sold if provided
            if (item.imei_id) {
                await supabase
                    .from('imei_records')
                    .update({ status: 'sold', sold_at: new Date().toISOString() })
                    .eq('id', item.imei_id);
            }
        }

        // Create finance entry
        await supabase.from('finances').insert({
            type: 'revenue',
            category: 'pos_sale',
            amount: totalAmount - (params.discount_amount || 0),
            description: `POS Sale ${posRef}`,
            reference_id: order.id,
            reference_type: 'order',
        });

        // Log status
        await supabase.from('order_status_logs').insert({
            order_id: order.id,
            old_status: null,
            new_status: 'delivered',
            note: 'POS sale - immediate delivery',
        });

        await auditService.log({
            action: 'create',
            entity: 'orders',
            entity_id: order.id,
            new_values: { pos_reference: posRef, total_amount: totalAmount, items_count: params.items.length },
        });

        return order;
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string) {
        const { data: current } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        const oldStatus = current?.status || null;

        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        // Log status change
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('order_status_logs').insert({
            order_id: orderId,
            old_status: oldStatus,
            new_status: newStatus,
            changed_by: user?.id || null,
            note: note || null,
        });

        await auditService.log({
            action: 'status_change',
            entity: 'orders',
            entity_id: orderId,
            old_values: { status: oldStatus },
            new_values: { status: newStatus },
        });

        return data;
    },

    async getOrderStatusLogs(orderId: string): Promise<OrderStatusLog[]> {
        const { data, error } = await supabase
            .from('order_status_logs')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as OrderStatusLog[];
    },

    async processReturn(orderId: string, reason: string) {
        const order = await this.getOrderById(orderId);
        if (!order) throw new Error('Order not found');

        // Return stock
        for (const item of (order.order_items || [])) {
            await stockService.recordMovement({
                product_id: item.product_id,
                change: item.quantity,
                type: 'return',
                reference_id: orderId,
                note: `Return: ${reason}`,
            });
        }

        // Update order
        await supabase
            .from('orders')
            .update({ status: 'cancelled', return_reason: reason })
            .eq('id', orderId);

        // Finance adjustment
        await supabase.from('finances').insert({
            type: 'expense',
            category: 'return',
            amount: Number(order.total_amount),
            description: `Return for order ${order.order_number}: ${reason}`,
            reference_id: orderId,
            reference_type: 'order',
        });

        await auditService.log({
            action: 'status_change',
            entity: 'orders',
            entity_id: orderId,
            old_values: { status: order.status },
            new_values: { status: 'cancelled', return_reason: reason },
        });
    }
};
