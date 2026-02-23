import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/admin-types";
import { auditService } from "./auditService";

export const productsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Product;
    },

    async create(product: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({
            action: 'create',
            entity: 'products',
            entity_id: data.id,
            new_values: data as unknown as Record<string, unknown>,
        });
        return data as Product;
    },

    async update(id: string, updates: Partial<Product>) {
        const old = await this.getById(id);
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        await auditService.log({
            action: 'update',
            entity: 'products',
            entity_id: id,
            old_values: old as unknown as Record<string, unknown>,
            new_values: data as unknown as Record<string, unknown>,
        });
        return data as Product;
    },

    async deleteProduct(id: string) {
        const old = await this.getById(id);
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await auditService.log({
            action: 'delete',
            entity: 'products',
            entity_id: id,
            old_values: old as unknown as Record<string, unknown>,
        });
    },

    async toggleActive(id: string, isActive: boolean) {
        return this.update(id, { is_active: isActive });
    },

    async bulkUpdate(updates: { id: string; changes: Partial<Product> }[]) {
        const results = [];
        for (const { id, changes } of updates) {
            const result = await this.update(id, changes);
            results.push(result);
        }
        return results;
    },

    parseCSV(csvText: string): { products: Partial<Product>[]; errors: string[] } {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return { products: [], errors: ['CSV must have headers and at least one data row'] };

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'brand', 'purchase_price', 'selling_price'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            return { products: [], errors: [`Missing required columns: ${missingHeaders.join(', ')}`] };
        }

        const products: Partial<Product>[] = [];
        const errors: string[] = [];

        for (let i = 1; i < Math.min(lines.length, 21); i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

            if (!row.name) { errors.push(`Row ${i}: name is required`); continue; }
            if (!row.brand) { errors.push(`Row ${i}: brand is required`); continue; }
            if (isNaN(Number(row.purchase_price))) { errors.push(`Row ${i}: invalid purchase_price`); continue; }
            if (isNaN(Number(row.selling_price))) { errors.push(`Row ${i}: invalid selling_price`); continue; }

            products.push({
                name: row.name,
                brand: row.brand,
                type: (row.type as Product['type']) || 'phone',
                purchase_price: Number(row.purchase_price),
                selling_price: Number(row.selling_price),
                quantity: Number(row.quantity) || 0,
                low_stock_threshold: Number(row.low_stock_threshold) || 5,
                sku: row.sku || undefined,
                barcode: row.barcode || undefined,
                color: row.color || undefined,
                storage_capacity: row.storage_capacity || undefined,
                description: row.description || undefined,
                supplier: row.supplier || undefined,
                is_active: true,
                is_featured: false,
            });
        }

        if (lines.length > 21) {
            errors.push(`Only first 20 data rows were processed (${lines.length - 1} total rows found)`);
        }

        return { products, errors };
    },

    async importCSV(csvText: string) {
        const { products, errors } = this.parseCSV(csvText);
        if (products.length === 0) return { imported: 0, errors };

        const importErrors = [...errors];
        let imported = 0;

        for (const product of products) {
            try {
                await this.create(product);
                imported++;
            } catch (e: unknown) {
                const errMsg = e instanceof Error ? e.message : String(e);
                importErrors.push(`Failed to import "${product.name}": ${errMsg}`);
            }
        }

        return { imported, errors: importErrors };
    },

    exportToCSV(products: Product[]): string {
        const headers = ['name', 'brand', 'type', 'sku', 'barcode', 'purchase_price', 'selling_price', 'quantity', 'low_stock_threshold', 'color', 'storage_capacity', 'supplier', 'is_active'];
        const rows = products.map(p =>
            headers.map(h => {
                const val = p[h as keyof Product];
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
            }).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    },

    calculateMargin(purchasePrice: number, sellingPrice: number): number {
        if (sellingPrice === 0) return 0;
        return Math.round(((sellingPrice - purchasePrice) / sellingPrice) * 100);
    },

    detectRotation(product: Product): Product['rotation_indicator'] {
        const now = new Date();
        const addedAt = new Date(product.added_at || now.toISOString());
        const daysInStock = Math.floor((now.getTime() - addedAt.getTime()) / (1000 * 60 * 60 * 24));

        if (product.quantity === 0) return 'dead';
        if (daysInStock < 15) return 'high';
        if (daysInStock < 30) return 'medium';
        if (daysInStock < 45) return 'slow';
        return 'dead';
    }
};
