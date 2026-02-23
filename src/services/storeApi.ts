import { supabase } from '@/integrations/supabase/client';

export interface StoreCategory {
    id: string;
    name: string;
    slug: string;
    type: string;
    product_count: number;
}

export interface StoreProduct {
    id: string;
    name: string;
    brand: string;
    selling_price: number;
    purchase_price: number;
    quantity: number;
    low_stock_threshold: number;
    image_url: string | null;
    images: string[] | null;
    color: string | null;
    storage_capacity: string | null;
    description: string | null;
    is_featured: boolean | null;
    is_active: boolean | null;
    category_id: string | null;
    type: string;
    warranty_months: number | null;
    sku: string | null;
    added_at: string;
}

export interface CustomerRequestPayload {
    name: string;
    phone: string;
    email?: string;
    product_id?: string;
    type: 'inquiry' | 'special_request' | 'maintenance';
    message: string;
    lang: string;
    ref: string;
}

export const storeApi = {
    /**
     * Fetch all categories with their product counts
     */
    async fetchCategories(): Promise<StoreCategory[]> {
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (catError) throw catError;

        // Get product counts per category
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('category_id')
            .eq('is_active', true);

        if (prodError) throw prodError;

        const countMap: Record<string, number> = {};
        products?.forEach(p => {
            if (p.category_id) {
                countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
            }
        });

        return (categories || []).map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            type: cat.type,
            product_count: countMap[cat.id] || 0,
        }));
    },

    /**
     * Fetch products with optional filters
     */
    async fetchProducts(opts?: {
        category?: string;
        limit?: number;
        search?: string;
        featured?: boolean;
    }): Promise<StoreProduct[]> {
        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('added_at', { ascending: false });

        if (opts?.category) {
            query = query.eq('category_id', opts.category);
        }

        if (opts?.featured) {
            query = query.eq('is_featured', true);
        }

        if (opts?.search) {
            query = query.ilike('name', `%${opts.search}%`);
        }

        if (opts?.limit) {
            query = query.limit(opts.limit);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []) as StoreProduct[];
    },

    /**
     * Fetch a single product by ID
     */
    async fetchProductById(id: string): Promise<StoreProduct | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as StoreProduct;
    },

    /**
     * Submit a customer request / inquiry
     */
    async submitCustomerRequest(payload: CustomerRequestPayload): Promise<void> {
        // Try to insert into customer_requests table.
        // If the table doesn't exist yet, this will fail gracefully.
        const { error } = await supabase
            .from('customer_requests' as any)
            .insert({
                name: payload.name,
                phone: payload.phone,
                email: payload.email || null,
                product_id: payload.product_id || null,
                type: payload.type,
                message: payload.message,
                lang: payload.lang,
                ref: payload.ref,
                status: 'new',
            });

        if (error) throw error;
    },
};
