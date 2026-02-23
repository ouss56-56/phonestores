import { supabase } from "@/integrations/supabase/client";
import type { Repair, RepairStatus, RepairPart } from "@/lib/admin-types";
import { auditService } from "./auditService";
import { stockService } from "./stockService";

export const repairsService = {
    async getAll(status?: RepairStatus) {
        let query = supabase
            .from('repairs')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        return data as Repair[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('repairs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Repair;
    },

    async create(repair: Partial<Repair>) {
        const { data, error } = await supabase
            .from('repairs')
            .insert(repair)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({ action: 'create', entity: 'repairs', entity_id: data.id, new_values: data as unknown as Record<string, unknown> });
        return data as Repair;
    },

    async updateStatus(id: string, newStatus: RepairStatus, notes?: string) {
        const old = await this.getById(id);

        // Prevent delivery without completion
        if (newStatus === 'delivered' && old.status !== 'ready') {
            throw new Error('Cannot deliver a device that is not in "ready" status');
        }

        const updates: Partial<Repair> = { status: newStatus };
        if (notes) updates.technician_notes = notes;

        const { data, error } = await supabase
            .from('repairs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({
            action: 'status_change',
            entity: 'repairs',
            entity_id: id,
            old_values: { status: old.status },
            new_values: { status: newStatus },
        });

        return data as Repair;
    },

    async addParts(repairId: string, parts: RepairPart[]) {
        const repair = await this.getById(repairId);
        const existingParts = repair.parts_used || [];
        const updatedParts = [...existingParts, ...parts];

        // Deduct parts from inventory
        for (const part of parts) {
            await stockService.recordMovement({
                product_id: part.product_id,
                change: -part.quantity,
                type: 'repair_use',
                reference_id: repairId,
                note: `Repair ${repair.tracking_id}: ${part.product_name}`,
            });
        }

        const totalCost = updatedParts.reduce((sum, p) => sum + (p.unit_cost * p.quantity), 0);

        const { data, error } = await supabase
            .from('repairs')
            .update({ parts_used: updatedParts, cost_actual: totalCost })
            .eq('id', repairId)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({
            action: 'update',
            entity: 'repairs',
            entity_id: repairId,
            new_values: { parts_added: parts.length, total_parts_cost: totalCost },
        });

        return data as Repair;
    },

    async markDelivered(repairId: string, signatureUrl?: string) {
        const repair = await this.getById(repairId);
        if (repair.status !== 'ready') {
            throw new Error('Device must be in "ready" status before delivery');
        }

        const updates: Partial<Repair> = { status: 'delivered' };
        if (signatureUrl) updates.signature_url = signatureUrl;

        // Create finance entry for repair revenue
        if (repair.cost_actual && repair.cost_actual > 0) {
            await supabase.from('finances').insert({
                type: 'revenue',
                category: 'repair',
                amount: repair.final_cost || repair.cost_actual,
                description: `Repair ${repair.tracking_id} delivered`,
                reference_id: repairId,
                reference_type: 'repair',
            });
        }

        return this.updateStatus(repairId, 'delivered');
    }
};
