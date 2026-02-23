import { supabase } from "@/integrations/supabase/client";
import type { AIRecommendation } from "@/lib/admin-types";

const OPENAI_ENDPOINT = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/ai-recommendations';

export const aiService = {
    async getRecommendations(): Promise<AIRecommendation[]> {
        try {
            // Gather context data
            const { data: lowStock } = await supabase
                .from('products')
                .select('id, name, quantity, low_stock_threshold, avg_daily_sales')
                .eq('is_active', true)
                .order('quantity', { ascending: true })
                .limit(10);

            const { data: slowMovers } = await supabase
                .from('products')
                .select('id, name, quantity, selling_price, added_at')
                .eq('is_active', true)
                .gt('quantity', 0)
                .order('added_at', { ascending: true })
                .limit(10);

            // Build recommendations locally (fallback if no AI key)
            const recommendations: AIRecommendation[] = [];

            // Restock recommendations
            const needsRestock = (lowStock || []).filter(p => p.quantity <= p.low_stock_threshold);
            if (needsRestock.length > 0) {
                recommendations.push({
                    type: 'restock',
                    title: 'Réapprovisionnement Recommandé',
                    description: `${needsRestock.length} produit(s) en stock critique: ${needsRestock.slice(0, 3).map(p => p.name).join(', ')}`,
                    action_label: 'Voir les produits',
                    confidence: 0.95,
                    data: { product_ids: needsRestock.map(p => p.id) },
                });
            }

            // Slow mover alerts
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 45);
            const oldStock = (slowMovers || []).filter(p => new Date(p.added_at) < cutoffDate);
            if (oldStock.length > 0) {
                const totalValue = oldStock.reduce((sum, p) => sum + (Number(p.selling_price) * p.quantity), 0);
                recommendations.push({
                    type: 'slow_mover_alert',
                    title: 'Produits à Rotation Lente',
                    description: `${oldStock.length} produit(s) en stock depuis +45 jours. Capital immobilisé: ${totalValue.toLocaleString()} DA`,
                    action_label: 'Analyser',
                    confidence: 0.88,
                    data: { product_ids: oldStock.map(p => p.id), total_value: totalValue },
                });
            }

            // Price reduction suggestion
            if (oldStock.length > 2) {
                recommendations.push({
                    type: 'price_reduction',
                    title: 'Suggestion de Réduction de Prix',
                    description: `Réduire les prix de ${Math.min(oldStock.length, 5)} produit(s) stagnants de 10-15% pourrait accélérer la rotation.`,
                    action_label: 'Appliquer',
                    confidence: 0.72,
                    data: { suggested_discount: 0.12 },
                });
            }

            // Log AI activity
            await supabase.from('ai_logs').insert({
                feature: 'recommendations',
                input_hash: btoa(JSON.stringify({ low_stock_count: needsRestock.length, slow_count: oldStock.length })).slice(0, 64),
                input_snapshot: { low_stock_count: needsRestock.length, slow_movers_count: oldStock.length },
                output_summary: `Generated ${recommendations.length} recommendations`,
                confidence: recommendations.length > 0 ? 0.85 : 0.5,
            });

            return recommendations;
        } catch (error) {
            console.error('AI recommendations failed:', error);
            return [{
                type: 'slow_mover_alert',
                title: 'Service IA',
                description: 'Les recommandations IA ne sont pas disponibles actuellement.',
                action_label: 'Réessayer',
                confidence: 0,
            }];
        }
    },

    async callOpenAI(prompt: string, context: Record<string, unknown>) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(OPENAI_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ prompt, context }),
            });

            if (!response.ok) {
                throw new Error(`AI endpoint error: ${response.status}`);
            }

            const result = await response.json();

            await supabase.from('ai_logs').insert({
                feature: 'openai_direct',
                input_hash: btoa(prompt).slice(0, 64),
                input_snapshot: { prompt_length: prompt.length },
                output_summary: result.summary || 'Response received',
                confidence: result.confidence || 0.5,
                tokens_used: result.tokens_used || 0,
            });

            return result;
        } catch (error) {
            console.error('OpenAI call failed:', error);
            throw error;
        }
    }
};
