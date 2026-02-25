import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Calculator, Zap, ArrowUpRight, ArrowDownRight, Package, Plus, Minus, History } from "lucide-react";
import { stockService } from "@/services/admin/stockService";
import { productsService } from "@/services/admin/productsService";
import { StatCard } from "./shared/StatCard";
import { StatusBadge } from "./shared/StatusBadge";
import type { StockMovement, Product } from "@/lib/admin-types";
import { toast } from "sonner";

export function InventoryModule() {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustment, setShowAdjustment] = useState(false);

    // Adjustment Form State
    const [adjProduct, setAdjProduct] = useState("");
    const [adjType, setAdjType] = useState<'adjustment' | 'initial'>('adjustment');
    const [adjChange, setAdjChange] = useState<number>(0);
    const [adjNote, setAdjNote] = useState("");

    const loadData = async () => {
        try {
            const [mvts, low, prods] = await Promise.all([
                stockService.getMovements(undefined, 100),
                stockService.getLowStockProducts(),
                productsService.getAll(),
            ]);
            setMovements(mvts);
            setLowStock(low);
            setProducts(prods);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateSnapshot = async () => {
        try {
            await stockService.createSnapshot();
            toast.success("Snapshot créé avec succès");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleAdjustment = async () => {
        if (!adjProduct || adjChange === 0) {
            toast.error("Veuillez sélectionner un produit et une quantité");
            return;
        }

        try {
            await stockService.recordMovement({
                product_id: adjProduct,
                change: adjChange,
                type: adjType,
                note: adjNote
            });
            toast.success("Mouvement de stock enregistré");
            setShowAdjustment(false);
            setAdjProduct("");
            setAdjChange(0);
            setAdjNote("");
            loadData();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
    }

    const totalIn = movements.filter(m => m.change > 0).reduce((sum, m) => sum + m.change, 0);
    const totalOut = movements.filter(m => m.change < 0).reduce((sum, m) => sum + Math.abs(m.change), 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Entrées Stock" value={totalIn} icon={ArrowUpRight} delay={0} />
                <StatCard title="Sorties Stock" value={totalOut} icon={ArrowDownRight} delay={0.05} />
                <StatCard title="Mouvements" value={movements.length} icon={Database} delay={0.1} />
                <StatCard title="Stock Critique" value={lowStock.length} icon={Zap} delay={0.15} />
            </div>

            <div className="flex justify-between items-center bg-admin-card/50 p-6 rounded-[2rem] border border-admin-border shadow-sm">
                <div>
                    <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest italic">Contrôle d'Inventaire</h3>
                    <p className="text-[10px] text-admin-secondary uppercase tracking-widest font-bold mt-1">Supervision des flux et ajustements manuels</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowAdjustment(!showAdjustment)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${showAdjustment ? 'bg-admin-btn text-white' : 'bg-admin-card border border-admin-border text-admin-primary'}`}>
                        {showAdjustment ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />} Ajustement Stock
                    </button>
                    <button onClick={handleCreateSnapshot}
                        className="bg-admin-card border border-admin-border text-admin-primary px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-admin-bg transition-all shadow-sm flex items-center gap-2">
                        <History className="w-4 h-4" /> Snapshot
                    </button>
                </div>
            </div>

            {/* Manual Adjustment Form */}
            {showAdjustment && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-admin-card rounded-[2.5rem] p-10 border border-admin-border space-y-8 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Calculator className="w-32 h-32" />
                    </div>
                    <h4 className="text-sm font-bold text-admin-title uppercase tracking-widest italic border-b border-admin-border pb-4 flex items-center gap-3">
                        <Package className="w-4 h-4 text-admin-btn" /> Nouvel Ajustement de Stock
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                            <label className="ml-1">Produit</label>
                            <select value={adjProduct} onChange={e => setAdjProduct(e.target.value)}
                                className="w-full bg-admin-bg border border-admin-border rounded-xl p-4 text-xs font-bold text-admin-title outline-none focus:border-admin-btn/40 transition-all shadow-sm">
                                <option value="">-- Sélectionner --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.quantity} en stock)</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                            <label className="ml-1">Variation (+/-)</label>
                            <input type="number" value={adjChange} onChange={e => setAdjChange(parseInt(e.target.value))}
                                className="w-full bg-admin-bg border border-admin-border rounded-xl p-4 text-xs font-bold text-admin-title outline-none focus:border-admin-btn/40 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                            <label className="ml-1">Raison / Note</label>
                            <input type="text" value={adjNote} onChange={e => setAdjNote(e.target.value)} placeholder="Ex: Casse, Retour client..."
                                className="w-full bg-admin-bg border border-admin-border rounded-xl p-4 text-xs font-bold text-admin-title outline-none focus:border-admin-btn/40 transition-all shadow-sm" />
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleAdjustment}
                                className="w-full bg-admin-btn text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8 shadow-sm">
                    <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 italic">
                        <Zap className="w-4 h-4 animate-pulse" /> Alerte Stock Critique ({lowStock.length})
                    </h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lowStock.slice(0, 6).map(p => (
                            <div key={p.id} className="bg-white border border-rose-100 rounded-[1.5rem] p-5 flex justify-between items-center shadow-sm hover:scale-105 transition-transform">
                                <div>
                                    <div className="text-xs font-bold text-admin-title">{p.name}</div>
                                    <div className="text-[9px] text-admin-secondary font-bold uppercase tracking-widest mt-1 opacity-70">{p.brand}</div>
                                </div>
                                <div className="text-xl font-mono-tech font-bold text-rose-500 bg-rose-50 w-12 h-12 flex items-center justify-center rounded-xl">{p.quantity}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stock Movements Log */}
            <div className="bg-admin-card rounded-[2.5rem] overflow-hidden border border-admin-border shadow-sm">
                <div className="p-8 border-b border-admin-border bg-admin-bg/30">
                    <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest italic">Journal des Mouvements</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-admin-bg/50 border-b border-admin-border">
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Date & Heure</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Produit</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Type d'Action</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Flux</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Note / Réf</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {movements.map(m => {
                                const productName = products.find(p => p.id === m.product_id)?.name || m.product_name || 'Produit inconnu';
                                return (
                                    <tr key={m.id} className="hover:bg-admin-bg/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] text-admin-secondary font-mono-tech font-bold uppercase">
                                                {new Date(m.created_at).toLocaleString('fr-FR', {
                                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[11px] font-bold text-admin-title uppercase tracking-tight">{productName}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <StatusBadge status={m.type} />
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-sm font-mono-tech font-bold ${m.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {m.change > 0 ? '+' : ''}{m.change}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-admin-primary font-bold uppercase tracking-widest">{m.note || '—'}</span>
                                                {m.reference_id && <span className="text-[8px] text-admin-secondary font-mono-tech opacity-60">ID: {m.reference_id}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-admin-border bg-admin-bg/30 text-center">
                    <span className="text-[10px] text-admin-secondary font-mono-tech font-bold uppercase tracking-widest opacity-60">Derniers {movements.length} mouvements enregistrés</span>
                </div>
            </div>
        </motion.div>
    );
}
