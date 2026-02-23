import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/admin-types";

export const accessoryService = {
    async getAccessories() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('type', 'accessory')
            .order('added_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    },

    async getCompatibleAccessories(phoneModel: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('type', 'accessory')
            .contains('compatible_models', [phoneModel]);

        if (error) throw error;
        return data as Product[];
    },

    calculateBundleValue(accessories: Product[]): { capital: number; potentialRevenue: number } {
        return accessories.reduce((acc, item) => ({
            capital: acc.capital + (item.purchase_price * item.quantity),
            potentialRevenue: acc.potentialRevenue + (item.selling_price * item.quantity)
        }), { capital: 0, potentialRevenue: 0 });
    },

    estimateRestock(accessory: Product): { suggestedQuantity: number; remainingDays: number } {
        // This would ideally use sales history, but for now we'll use a placeholder logic
        // based on current quantity and a mock consumption rate
        const dailyRate = 0.5; // Placeholder: 0.5 items sold per day
        const remainingDays = Math.floor(accessory.quantity / dailyRate);

        let suggestedQuantity = 0;
        if (remainingDays < 7) {
            suggestedQuantity = Math.max(20, (30 - accessory.quantity)); // Restock to 30 items
        }

        return { suggestedQuantity, remainingDays };
    }
};
