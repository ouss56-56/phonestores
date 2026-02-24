import { supabase } from "@/integrations/supabase/client";
import type { AuditAction, AuditLog } from "@/lib/admin-types";

export const auditService = {
    async log(params: {
        action: AuditAction;
        entity: string;
        entity_id?: string;
        old_values?: Record<string, unknown>;
        new_values?: Record<string, unknown>;
    }) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('audit_logs').insert({
            user_id: user?.id,
            action: params.action,
            entity: params.entity,
            entity_id: params.entity_id || null,
            old_values: params.old_values ? JSON.parse(JSON.stringify(params.old_values)) : null,
            new_values: params.new_values ? JSON.parse(JSON.stringify(params.new_values)) : null,
        });

        if (error) console.error('Audit log failed:', error);
    },

    async getLogsForEntity(entity: string, entityId?: string, limit = 50): Promise<AuditLog[]> {
        let query = supabase
            .from('audit_logs')
            .select('*')
            .eq('entity', entity)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (entityId) {
            query = query.eq('entity_id', entityId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as unknown as AuditLog[];
    },

    async getRecentLogs(limit = 100): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as unknown as AuditLog[];
    }
};
