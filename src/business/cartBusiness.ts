// ============================================================
// Cart Business Logic
// Stock validation before adding items to cart
// ============================================================
import { supabase } from '@/integrations/supabase/client';
import type { CartItem } from '@/stores/cartStore';

export const cartBusiness = {
    /**
     * Validate that a product is available before adding to cart
     */
    async validateProductForCart(productId: string): Promise<{
        valid: boolean;
        error?: string;
        availableQuantity?: number;
    }> {
        const { data: product, error } = await supabase
            .from('products')
            .select('id, name, quantity, is_active')
            .eq('id', productId)
            .single();

        if (error || !product) {
            return { valid: false, error: 'Produit introuvable' };
        }

        if (!product.is_active) {
            return { valid: false, error: 'Ce produit n\'est plus disponible' };
        }

        if (product.quantity <= 0) {
            return { valid: false, error: 'Rupture de stock' };
        }

        return { valid: true, availableQuantity: product.quantity };
    },

    /**
     * Validate all cart items still have sufficient stock (before checkout)
     */
    async validateCartStock(items: CartItem[]): Promise<{
        valid: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];

        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('quantity, name, is_active')
                .eq('id', item.id)
                .single();

            if (!product) {
                errors.push(`"${item.name}" n'existe plus`);
                continue;
            }

            if (!product.is_active) {
                errors.push(`"${item.name}" n'est plus disponible`);
                continue;
            }

            if (product.quantity < item.quantity) {
                errors.push(
                    `"${item.name}" : seulement ${product.quantity} en stock (${item.quantity} dans le panier)`
                );
            }
        }

        return { valid: errors.length === 0, errors };
    },
};
