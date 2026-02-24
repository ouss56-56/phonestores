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
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
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
                    <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest">Offres & Codes Promo</h3>
                    <button onClick={() => setShowAdd(!showAdd)} className="bg-admin-btn text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">
                        Nouvelle Promotion
                    </button>
                </div>

                {showAdd && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-admin-card p-8 border border-admin-border rounded-[2rem] space-y-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Nom de l'offre</label>
                                <input type="text" value={newPromo.name} onChange={e => setNewPromo({ ...newPromo, name: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Type</label>
                                <select value={newPromo.type} onChange={e => setNewPromo({ ...newPromo, type: e.target.value as any })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all">
                                    <option value="discount_percent">Remise %</option>
                                    <option value="discount_fixed">Remise Fixe (DA)</option>
                                    <option value="coupon">Code Promo</option>
                                    <option value="bundle">Lot (Bundle)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Valeur</label>
                                <input type="number" value={newPromo.value} onChange={e => setNewPromo({ ...newPromo, value: parseFloat(e.target.value) })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            </div>
                            {newPromo.type === 'coupon' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Code Coupon</label>
                                    <input type="text" placeholder="EX: LUMINA20" value={newPromo.coupon_code || ''} onChange={e => setNewPromo({ ...newPromo, coupon_code: e.target.value.toUpperCase() })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Date de Fin</label>
                                <input type="date" onChange={e => setNewPromo({ ...newPromo, ends_at: new Date(e.target.value).toISOString() })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Limite d'utilisation</label>
                                <input type="number" placeholder="Illimité" onChange={e => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            </div>
                        </div>
                        <button onClick={handleCreate} className="bg-admin-btn text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">Lancer l'Offre</button>
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promos.map(p => (
                        <div key={p.id} className="bg-admin-card p-8 border border-admin-border rounded-[2.5rem] relative overflow-hidden group shadow-sm transition-all hover:shadow-soft">
                            {!p.is_active && <div className="absolute inset-0 bg-admin-bg/60 backdrop-blur-[1px] z-10 flex items-center justify-center font-bold text-admin-secondary/40 uppercase tracking-[0.5em] -rotate-12 pointer-events-none">Inactive</div>}
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 bg-admin-bg rounded-2xl border border-admin-border">
                                    {p.type === 'coupon' ? <Gift className="w-5 h-5 text-admin-btn" /> : <Tag className="w-5 h-5 text-admin-btn" />}
                                </div>
                                <button onClick={() => toggleActive(p.id, p.is_active)} className={`p-2.5 rounded-xl transition-all shadow-sm ${p.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' : 'bg-admin-bg text-admin-secondary border border-admin-border hover:bg-white'}`}>
                                    <Power className="w-4.5 h-4.5" />
                                </button>
                            </div>
                            <h4 className="text-lg font-bold text-admin-title mb-2 uppercase tracking-tight">{p.name}</h4>
                            <div className="text-3xl font-mono-tech font-bold text-admin-title mb-8">
                                {p.type === 'discount_percent' ? `${p.value}%` : `${Number(p.value).toLocaleString()} DA`}
                                <span className="text-[10px] text-admin-secondary uppercase ml-2 tracking-widest font-bold">OFF</span>
                            </div>
                            {p.coupon_code && (
                                <div className="bg-admin-bg border border-admin-border rounded-xl p-4 mb-8 flex justify-between items-center group-hover:border-admin-secondary/20 transition-all shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-admin-secondary">Code:</span>
                                    <span className="text-xs font-mono-tech font-bold text-admin-btn tracking-[0.2em]">{p.coupon_code}</span>
                                </div>
                            )}
                            <div className="space-y-3 text-[10px] text-admin-secondary uppercase font-bold tracking-widest border-t border-admin-border pt-6">
                                <div className="flex justify-between">
                                    <span>Utilisations:</span>
                                    <span className="text-admin-title font-mono-tech">{p.current_uses || 0} / {p.max_uses || '∞'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Expire:</span>
                                    <span className="text-admin-title">{p.ends_at ? new Date(p.ends_at).toLocaleDateString() : 'Jamais'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
