// ============================================================
// Notification Business Logic
// Aggregates admin notifications from various sources
// ============================================================
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotification {
    id: string;
    type: 'new_order' | 'low_stock' | 'new_inquiry' | 'order_cancelled';
    title: string;
    description: string;
    timestamp: string;
    is_read: boolean;
    link?: string; // Tab to navigate to
    meta?: Record<string, unknown>;
}

export const notificationBusiness = {
    /**
     * Fetch all admin notifications aggregated from different sources
     */
    async getAdminNotifications(): Promise<AdminNotification[]> {
        const notifications: AdminNotification[] = [];

        // 1. Pending orders (new orders awaiting confirmation)
        const { data: pendingOrders } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, total_amount, created_at')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(10);

        if (pendingOrders) {
            for (const order of pendingOrders) {
                notifications.push({
                    id: `order-${order.id}`,
                    type: 'new_order',
                    title: 'Nouvelle commande',
                    description: `${order.customer_name} — ${new Intl.NumberFormat('fr-DZ').format(Number(order.total_amount))} DA`,
                    timestamp: order.created_at,
                    is_read: false,
                    link: 'sales',
                    meta: { orderId: order.id, orderNumber: order.order_number },
                });
            }
        }

        // 2. Low stock alerts
        const { data: lowStockProducts } = await supabase
            .from('products')
            .select('id, name, quantity, low_stock_threshold')
            .eq('is_active', true)
            .limit(10);

        if (lowStockProducts) {
            const lowStock = lowStockProducts.filter(
                (p) => p.quantity <= p.low_stock_threshold
            );
            for (const product of lowStock) {
                notifications.push({
                    id: `stock-${product.id}`,
                    type: 'low_stock',
                    title: 'Stock faible',
                    description: `${product.name} — ${product.quantity} restant(s)`,
                    timestamp: new Date().toISOString(),
                    is_read: false,
                    link: 'inventory',
                    meta: { productId: product.id },
                });
            }
        }

        // 3. New customer inquiries
        try {
            const { data: inquiries } = await supabase
                .from('customer_requests' as any)
                .select('id, name, type, message, created_at')
                .eq('status', 'new')
                .order('created_at', { ascending: false })
                .limit(5);

            if (inquiries) {
                for (const inq of inquiries as any[]) {
                    notifications.push({
                        id: `inquiry-${inq.id}`,
                        type: 'new_inquiry',
                        title: 'Nouvelle demande',
                        description: `${inq.name} — ${inq.type}`,
                        timestamp: inq.created_at,
                        is_read: false,
                        link: 'customers',
                        meta: { inquiryId: inq.id },
                    });
                }
            }
        } catch {
            // customer_requests table may not exist yet — fail silently
        }

        // Sort by timestamp (newest first)
        notifications.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return notifications;
    },
};
