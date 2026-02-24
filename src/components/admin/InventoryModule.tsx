import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Calculator, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { stockService } from "@/services/admin/stockService";
import { StatCard } from "./shared/StatCard";
import { StatusBadge } from "./shared/StatusBadge";
import type { StockMovement } from "@/lib/admin-types";
import { toast } from "sonner";

export function InventoryModule() {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [mvts, low] = await Promise.all([
                stockService.getMovements(undefined, 100),
                stockService.getLowStockProducts(),
            ]);
            setMovements(mvts);
            setLowStock(low);
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

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest">Gestion des Stocks</h3>
                <button onClick={handleCreateSnapshot}
                    className="bg-admin-btn text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">
                    Créer un Snapshot
                </button>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 animate-pulse" /> Produits en Stock Critique ({lowStock.length})
                    </h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStock.slice(0, 6).map(p => (
                            <div key={p.id} className="bg-white border border-rose-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="text-xs font-bold text-admin-title">{p.name}</div>
                                    <div className="text-[10px] text-admin-secondary font-bold uppercase tracking-widest mt-1">{p.brand}</div>
                                </div>
                                <div className="text-xl font-mono-tech font-bold text-rose-500">{p.quantity}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stock Movements Log */}
            <div className="bg-admin-card rounded-[2.5rem] overflow-hidden border border-admin-border shadow-sm">
                <div className="p-6 border-b border-admin-border bg-admin-bg/50">
                    <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest">Journal des Mouvements</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-admin-bg/30 border-b border-admin-border">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Date</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Type</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Changement</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Référence</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {movements.map(m => (
                                <tr key={m.id} className="hover:bg-admin-bg/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] text-admin-secondary font-mono-tech font-bold">
                                            {new Date(m.created_at).toLocaleString('fr-FR')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={m.type} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-mono-tech font-bold ${m.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {m.change > 0 ? '+' : ''}{m.change}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] text-admin-secondary font-mono-tech font-bold">{m.reference_id || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] text-admin-secondary font-medium uppercase tracking-tight">{m.note || '—'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
