// ============================================================
// Order Business Logic
// Orchestrates order creation with stock, finance, and audit
// ============================================================
import { supabase } from '@/integrations/supabase/client';
import { stockService } from '@/services/admin/stockService';
import { auditService } from '@/services/admin/auditService';
import type { CheckoutFormData } from '@/lib/validation';
import type { CartItem } from '@/stores/cartStore';

export interface OrderResult {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    itemCount: number;
}

export const orderBusiness = {
    /**
     * Place an order from the storefront checkout.
     * 1. Validates stock availability
     * 2. Creates order + order_items
     * 3. Decrements stock via stock_movements
     * 4. Creates finance entry
     * 5. Returns order confirmation data
     */
    async placeOrder(
        items: CartItem[],
        customerInfo: CheckoutFormData
    ): Promise<OrderResult> {
        if (items.length === 0) {
            throw new Error('Le panier est vide');
        }

        // 1. Validate stock for all items
        const stockErrors: string[] = [];
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('quantity, name, is_active')
                .eq('id', item.id)
                .single();

            if (!product) {
                stockErrors.push(`Produit "${item.name}" introuvable`);
                continue;
            }
            if (!product.is_active) {
                stockErrors.push(`"${item.name}" n'est plus disponible`);
                continue;
            }
            if (product.quantity < item.quantity) {
                stockErrors.push(
                    `"${item.name}" : stock insuffisant (${product.quantity} disponible, ${item.quantity} demandé)`
                );
            }
        }

        if (stockErrors.length > 0) {
            throw new Error(stockErrors.join('\n'));
        }

        // 2. Calculate total
        const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // 3. Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: customerInfo.name,
                customer_phone: customerInfo.phone,
                customer_email: customerInfo.email || null,
                notes: customerInfo.notes || null,
                total_amount: totalAmount,
                order_number: 'ORD-' + Date.now(), // Trigger will override this
                status: 'pending',
                payment_method: 'cash',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Create order items
        const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);
        if (itemsError) throw itemsError;

        // 5. Decrement stock for each item
        for (const item of items) {
            await stockService.recordMovement({
                product_id: item.id,
                change: -item.quantity,
                type: 'sale',
                reference_id: order.id,
                note: `Vente en ligne #${order.order_number}`,
            });
        }

        // 6. Create finance entry
        await supabase.from('finances').insert({
            type: 'revenue',
            category: 'online_sale',
            amount: totalAmount,
            description: `Commande en ligne #${order.order_number}`,
            reference_id: order.id,
            reference_type: 'order',
        });

        // 7. Log order status
        await supabase.from('order_status_logs').insert({
            order_id: order.id,
            old_status: null,
            new_status: 'pending',
            note: 'Commande créée depuis la boutique en ligne',
        });

        return {
            orderId: order.id,
            orderNumber: order.order_number,
            totalAmount,
            itemCount: items.length,
        };
    },

    /**
     * Fetch an order by its order number (for confirmation page)
     */
    async getOrderByNumber(orderNumber: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name, image_url, brand))')
            .eq('order_number', orderNumber)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update order status with full audit trail (admin use)
     */
    async updateOrderStatus(
        orderId: string,
        newStatus: string,
        note?: string
    ) {
        // Get current status
        const { data: current } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        const oldStatus = current?.status || null;

        // Update
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        // Log status change
        const {
            data: { user },
        } = await supabase.auth.getUser();

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
};
