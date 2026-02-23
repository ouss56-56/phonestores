import { supabase } from "@/integrations/supabase/client";
import type { Customer, CustomerSegment } from "@/lib/admin-types";
import { auditService } from "./auditService";

export const customersService = {
    async getAll(segment?: CustomerSegment) {
        let query = supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (segment) query = query.eq('segment', segment);

        const { data, error } = await query;
        if (error) throw error;
        return data as Customer[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Customer;
    },

    async create(customer: Partial<Customer>) {
        const { data, error } = await supabase
            .from('customers')
            .insert(customer)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'create', entity: 'customers', entity_id: data.id, new_values: data as unknown as Record<string, unknown> });
        return data as Customer;
    },

    async update(id: string, updates: Partial<Customer>) {
        const { data, error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'update', entity: 'customers', entity_id: id, new_values: updates as Record<string, unknown> });
        return data as Customer;
    },

    async getOrderHistory(customerId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name))')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getRepairHistory(customerId: string) {
        const { data, error } = await supabase
            .from('repairs')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async findOrCreateByPhone(phone: string, name: string) {
        const { data: existing } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();

        if (existing) return existing as Customer;

        return this.create({ name, phone, segment: 'regular' });
    },

    async addPoints(customerId: string, points: number) {
        const customer = await this.getById(customerId);
        const newPoints = customer.loyalty_points + points;
        return this.update(customerId, { loyalty_points: newPoints });
    },

    async updateSegment(customerId: string, segment: CustomerSegment) {
        return this.update(customerId, { segment });
    }
};
