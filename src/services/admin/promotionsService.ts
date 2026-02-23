import { supabase } from "@/integrations/supabase/client";
import type { Promotion } from "@/lib/admin-types";
import { auditService } from "./auditService";

export const promotionsService = {
    async getAll(includeExpired = false) {
        let query = supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false });

        if (!includeExpired) {
            query = query.or('ends_at.is.null,ends_at.gt.' + new Date().toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Promotion[];
    },

    async getActive() {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .lte('starts_at', now)
            .or('ends_at.is.null,ends_at.gt.' + now);

        if (error) throw error;
        return data as Promotion[];
    },

    async create(promo: Partial<Promotion>) {
        const { data, error } = await supabase
            .from('promotions')
            .insert(promo)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'create', entity: 'promotions', entity_id: data.id, new_values: data as unknown as Record<string, unknown> });
        return data as Promotion;
    },

    async update(id: string, updates: Partial<Promotion>) {
        const { data, error } = await supabase
            .from('promotions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'update', entity: 'promotions', entity_id: id, new_values: updates as Record<string, unknown> });
        return data as Promotion;
    },

    async toggleActive(id: string, isActive: boolean) {
        return this.update(id, { is_active: isActive });
    },

    async validateCoupon(code: string): Promise<Promotion | null> {
        const now = new Date().toISOString();
        const { data } = await supabase
            .from('promotions')
            .select('*')
            .eq('coupon_code', code)
            .eq('is_active', true)
            .lte('starts_at', now)
            .or('ends_at.is.null,ends_at.gt.' + now)
            .maybeSingle();

        if (!data) return null;

        // Check max uses
        if (data.max_uses && data.current_uses >= data.max_uses) return null;

        return data as Promotion;
    },

    async incrementUse(id: string) {
        const { data: promo } = await supabase
            .from('promotions')
            .select('current_uses')
            .eq('id', id)
            .single();

        if (promo) {
            await supabase
                .from('promotions')
                .update({ current_uses: (promo.current_uses || 0) + 1 })
                .eq('id', id);
        }
    }
};
