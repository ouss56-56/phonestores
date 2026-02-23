import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Calendar, Percent, Gift, Search, Trash2, Power } from "lucide-react";
import { promotionsService } from "@/services/admin/promotionsService";
import { StatCard } from "./shared/StatCard";
import { StatusBadge } from "./shared/StatusBadge";
import type { Promotion } from "@/lib/admin-types";
import { toast } from "sonner";

export function PromotionsModule() {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
        name: '', type: 'discount_percent', value: 0, is_active: true, starts_at: new Date().toISOString()
    });

    const loadData = async () => {
        try {
            const data = await promotionsService.getAll(true);
            setPromos(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        try {
            await promotionsService.create(newPromo);
            toast.success("Promotion créée");
            setShowAdd(false);
            setNewPromo({ name: '', type: 'discount_percent', value: 0, is_active: true, starts_at: new Date().toISOString() });
            loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    const toggleActive = async (id: string, active: boolean) => {
        try {
            await promotionsService.toggleActive(id, !active);
            toast.success(active ? "Désactivée" : "Activée");
            loadData();
        } catch (e) { toast.error("Erreur"); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Promos Actives" value={promos.filter(p => p.is_active).length} icon={Tag} delay={0} />
                <StatCard title="Coupons Créés" value={promos.filter(p => p.type === 'coupon').length} icon={Gift} delay={0.1} />
                <StatCard title="Utilisations" value={promos.reduce((sum, p) => sum + (p.current_uses || 0), 0)} icon={Percent} delay={0.2} />
                <StatCard title="Expire Bientôt" value={promos.filter(p => p.ends_at && new Date(p.ends_at) < new Date(Date.now() + 7 * 86400000)).length} icon={Calendar} delay={0.3} />
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest">Offres & Codes Promo</h3>
                    <button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-background px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all outline-none">
                        Nouvelle Promotion
                    </button>
                </div>

                {showAdd && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-white/5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Nom de l'offre</label>
                                <input type="text" value={newPromo.name} onChange={e => setNewPromo({ ...newPromo, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Type</label>
                                <select value={newPromo.type} onChange={e => setNewPromo({ ...newPromo, type: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white">
                                    <option value="discount_percent">Remise %</option>
                                    <option value="discount_fixed">Remise Fixe (DA)</option>
                                    <option value="coupon">Code Promo</option>
                                    <option value="bundle">Lot (Bundle)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Valeur</label>
                                <input type="number" value={newPromo.value} onChange={e => setNewPromo({ ...newPromo, value: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            </div>
                            {newPromo.type === 'coupon' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Code Coupon</label>
                                    <input type="text" placeholder="EX: LUMINA20" value={newPromo.coupon_code || ''} onChange={e => setNewPromo({ ...newPromo, coupon_code: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Date de Fin</label>
                                <input type="date" onChange={e => setNewPromo({ ...newPromo, ends_at: new Date(e.target.value).toISOString() })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold">Limite d'utilisation</label>
                                <input type="number" placeholder="Illimité" onChange={e => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            </div>
                        </div>
                        <button onClick={handleCreate} className="bg-primary text-background px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Lancer l'Offre</button>
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promos.map(p => (
                        <div key={p.id} className="glass-card p-6 border border-white/5 relative overflow-hidden group">
                            {!p.is_active && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center font-bold text-white/40 uppercase tracking-[0.5em] -rotate-12 pointer-events-none">Inactive</div>}
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    {p.type === 'coupon' ? <Gift className="w-5 h-5 text-primary" /> : <Tag className="w-5 h-5 text-primary" />}
                                </div>
                                <button onClick={() => toggleActive(p.id, p.is_active)} className={`p-2 rounded-xl transition-all ${p.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>
                                    <Power className="w-4 h-4" />
                                </button>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">{p.name}</h4>
                            <div className="text-2xl font-mono-tech font-bold text-white mb-6">
                                {p.type === 'discount_percent' ? `${p.value}%` : `${Number(p.value).toLocaleString()} DA`}
                                <span className="text-[10px] text-muted-foreground uppercase ml-2 tracking-widest">OFF</span>
                            </div>
                            {p.coupon_code && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-6 flex justify-between items-center group-hover:border-primary/40 transition-all">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Code:</span>
                                    <span className="text-xs font-mono-tech font-bold text-white tracking-widest">{p.coupon_code}</span>
                                </div>
                            )}
                            <div className="space-y-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                <div className="flex justify-between">
                                    <span>Utilisations:</span>
                                    <span className="text-white font-mono-tech">{p.current_uses || 0} / {p.max_uses || '∞'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Expire:</span>
                                    <span className="text-white">{p.ends_at ? new Date(p.ends_at).toLocaleDateString() : 'Jamais'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
