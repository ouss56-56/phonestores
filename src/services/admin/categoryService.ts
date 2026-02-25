import { supabase } from "@/integrations/supabase/client";
import { auditService } from "./auditService";

export interface Category {
    id: string;
    name: string;
    slug: string;
    type: string;
    parent_id: string | null;
    created_at: string;
}

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Category[];
    },

    async getById(id: string): Promise<Category> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Category;
    },

    async create(category: { name: string; slug: string; type: string; parent_id?: string | null }): Promise<Category> {
        const { data, error } = await supabase
            .from('categories')
            .insert(category)
            .select()
            .single();

        if (error) throw error;

        await auditService.log({
            action: 'create',
            entity: 'categories',
            entity_id: data.id,
            new_values: data as unknown as Record<string, unknown>,
        });

        return data as Category;
    },

    async update(id: string, updates: Partial<Pick<Category, 'name' | 'slug' | 'type' | 'parent_id'>>): Promise<Category> {
        const old = await this.getById(id);

        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await auditService.log({
            action: 'update',
            entity: 'categories',
            entity_id: id,
            old_values: old as unknown as Record<string, unknown>,
            new_values: data as unknown as Record<string, unknown>,
        });

        return data as Category;
    },

    async deleteCategory(id: string): Promise<void> {
        const old = await this.getById(id);

        // Check if category has products
        const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', id);

        if (count && count > 0) {
            throw new Error(`Impossible de supprimer: ${count} produit(s) utilisent cette catégorie`);
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await auditService.log({
            action: 'delete',
            entity: 'categories',
            entity_id: id,
            old_values: old as unknown as Record<string, unknown>,
        });
    },

    async getProductCount(categoryId: string): Promise<number> {
        const { count, error } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', categoryId)
            .eq('is_active', true);

        if (error) throw error;
        return count || 0;
    },
};
