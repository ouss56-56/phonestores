import { supabase } from "@/integrations/supabase/client";
import type { DashboardMetrics } from "@/lib/admin-types";

export const dashboardService = {
    async getMetrics(): Promise<DashboardMetrics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Today's orders
        const { data: todayOrders } = await supabase
            .from('orders')
            .select('total_amount, id')
            .gte('created_at', todayISO)
            .neq('status', 'cancelled');

        const todaySales = todayOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
        const ordersCount = todayOrders?.length || 0;
        const avgInvoice = ordersCount > 0 ? todaySales / ordersCount : 0;

        // Low stock
        const { count: lowStockCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
            .filter('quantity', 'lte', 'low_stock_threshold');

        // Slow moving (>45 days with no sale)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 45);
        const { count: slowCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
            .lt('added_at', cutoff.toISOString())
            .gt('quantity', 0);

        // Repairs in progress
        const { count: repairCount } = await supabase
            .from('repairs')
            .select('id', { count: 'exact', head: true })
            .in('status', ['received', 'diagnosing', 'waiting_parts', 'repairing']);

        // Estimate daily profit (simplified: today's sales * avg margin)
        const { data: products } = await supabase
            .from('products')
            .select('purchase_price, selling_price')
            .eq('is_active', true);

        let avgMarginPct = 0.15;
        if (products && products.length > 0) {
            const totalMargin = products.reduce((sum, p) => {
                const sp = Number(p.selling_price);
                const pp = Number(p.purchase_price);
                return sum + (sp > 0 ? (sp - pp) / sp : 0);
            }, 0);
            avgMarginPct = totalMargin / products.length;
        }

        return {
            today_sales: todaySales,
            daily_net_profit: Math.round(todaySales * avgMarginPct),
            orders_count: ordersCount,
            avg_invoice_value: Math.round(avgInvoice),
            low_stock_count: lowStockCount || 0,
            slow_moving_count: slowCount || 0,
            devices_in_repair: repairCount || 0,
        };
    },

    async getSalesChart(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .gte('created_at', since.toISOString())
            .neq('status', 'cancelled')
            .order('created_at', { ascending: true });

        if (!data) return [];

        // Group by day
        const grouped: Record<string, { date: string; revenue: number; orders: number }> = {};
        data.forEach(order => {
            const day = order.created_at.split('T')[0];
            if (!grouped[day]) grouped[day] = { date: day, revenue: 0, orders: 0 };
            grouped[day].revenue += Number(order.total_amount);
            grouped[day].orders += 1;
        });

        return Object.values(grouped);
    },

    async getCapitalDistribution() {
        const { data: products } = await supabase
            .from('products')
            .select('type, purchase_price, quantity')
            .eq('is_active', true);

        if (!products) return [];

        const dist: Record<string, number> = {};
        products.forEach(p => {
            const key = p.type || 'other';
            if (!dist[key]) dist[key] = 0;
            dist[key] += Number(p.purchase_price) * p.quantity;
        });

        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    },

    /**
     * Get revenue distribution by category
     */
    async getCategoryPerformance(): Promise<{ name: string; revenue: number }[]> {
        const { data: salesData } = await supabase
            .from('order_items')
            .select('quantity, unit_price, products(category_id, categories(name))')
            .not('products', 'is', null);

        if (!salesData) return [];

        const perf: Record<string, number> = {};
        salesData.forEach((item: any) => {
            const catName = item.products?.categories?.name || 'Inconnu';
            const revenue = Number(item.quantity) * Number(item.unit_price);
            perf[catName] = (perf[catName] || 0) + revenue;
        });

        return Object.entries(perf).map(([name, revenue]) => ({ name, revenue }));
    },

    /**
     * Get monthly sales for the current year
     */
    async getYearlySalesChart() {
        const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

        const { data } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .gte('created_at', yearStart)
            .neq('status', 'cancelled')
            .order('created_at', { ascending: true });

        if (!data) return [];

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const grouped: Record<string, { date: string; revenue: number; orders: number }> = {};

        // Initialize all months
        months.forEach(m => {
            grouped[m] = { date: m, revenue: 0, orders: 0 };
        });

        data.forEach(order => {
            const date = new Date(order.created_at);
            const monthName = months[date.getMonth()];
            grouped[monthName].revenue += Number(order.total_amount);
            grouped[monthName].orders += 1;
        });

        return Object.values(grouped);
    }
};
