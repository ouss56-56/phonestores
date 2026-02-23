import { supabase } from "@/integrations/supabase/client";
import type { FinanceEntry, FinanceType } from "@/lib/admin-types";

export const financeService = {
    async getEntries(type?: FinanceType, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        let query = supabase
            .from('finances')
            .select('*')
            .gte('date', since.toISOString())
            .order('date', { ascending: false });

        if (type) query = query.eq('type', type);

        const { data, error } = await query;
        if (error) throw error;
        return data as FinanceEntry[];
    },

    async createEntry(entry: Partial<FinanceEntry>) {
        const { data, error } = await supabase
            .from('finances')
            .insert(entry)
            .select()
            .single();

        if (error) throw error;
        return data as FinanceEntry;
    },

    async getPnL(days = 30) {
        const entries = await this.getEntries(undefined, days);

        const revenue = entries.filter(e => e.type === 'revenue').reduce((sum, e) => sum + Number(e.amount), 0);
        const expenses = entries.filter(e => ['expense', 'purchase', 'payroll'].includes(e.type)).reduce((sum, e) => sum + Number(e.amount), 0);

        const byCategory: Record<string, number> = {};
        entries.forEach(e => {
            const cat = e.category || e.type;
            if (!byCategory[cat]) byCategory[cat] = 0;
            byCategory[cat] += Number(e.amount) * (e.type === 'revenue' ? 1 : -1);
        });

        return {
            revenue,
            expenses,
            net_profit: revenue - expenses,
            by_category: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
        };
    },

    async getCashFlow(days = 30) {
        const entries = await this.getEntries(undefined, days);
        const grouped: Record<string, { date: string; inflow: number; outflow: number }> = {};

        entries.forEach(e => {
            const day = e.date.split('T')[0];
            if (!grouped[day]) grouped[day] = { date: day, inflow: 0, outflow: 0 };
            if (e.type === 'revenue') {
                grouped[day].inflow += Number(e.amount);
            } else {
                grouped[day].outflow += Number(e.amount);
            }
        });

        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }
};
