import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { financeService } from "@/services/admin/financeService";
import { StatCard } from "./shared/StatCard";
import { ExportButtons } from "./shared/ExportButtons";
import { exportService } from "@/services/admin/exportService";
import type { FinanceEntry, FinanceType } from "@/lib/admin-types";
import { toast } from "sonner";

export function FinanceModule() {
    const [pnl, setPnl] = useState<{ revenue: number; expenses: number; net_profit: number; by_category: { category: string; amount: number }[] } | null>(null);
    const [cashFlow, setCashFlow] = useState<{ date: string; inflow: number; outflow: number }[]>([]);
    const [entries, setEntries] = useState<FinanceEntry[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newEntry, setNewEntry] = useState<Partial<FinanceEntry>>({ type: 'expense', amount: 0, description: '', category: '' });

    const loadData = async () => {
        try {
            const [p, cf, ent] = await Promise.all([
                financeService.getPnL(30),
                financeService.getCashFlow(30),
                financeService.getEntries(undefined, 30),
            ]);
            setPnl(p);
            setCashFlow(cf);
            setEntries(ent);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleAddEntry = async () => {
        try {
            await financeService.createEntry({ ...newEntry, date: new Date().toISOString() });
            toast.success("Écriture ajoutée");
            setShowAddForm(false);
            setNewEntry({ type: 'expense', amount: 0, description: '', category: '' });
            loadData();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleExportPDF = () => {
        if (!pnl) return;
        exportService.generateReportPDF(`Rapport Financier - ${new Date().toLocaleDateString('fr-FR')}`, [
            {
                heading: 'Résumé P&L (30 jours)', rows: [
                    [`Revenus: ${pnl.revenue.toLocaleString()} DA`],
                    [`Dépenses: ${pnl.expenses.toLocaleString()} DA`],
                    [`Profit Net: ${pnl.net_profit.toLocaleString()} DA`],
                ]
            },
            { heading: 'Par Catégorie', rows: pnl.by_category.map(c => [`${c.category}: ${c.amount.toLocaleString()} DA`]) },
        ]);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
    }

    const p = pnl || { revenue: 0, expenses: 0, net_profit: 0, by_category: [] };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest">Rapports Financiers (30 jours)</h3>
                <div className="flex gap-3">
                    <ExportButtons onExportPDF={handleExportPDF} />
                    <button onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-primary text-background px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" /> Écriture
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Revenus" value={`${p.revenue.toLocaleString()} DA`} icon={TrendingUp} delay={0} />
                <StatCard title="Dépenses" value={`${p.expenses.toLocaleString()} DA`} icon={TrendingDown} delay={0.05} />
                <StatCard title="Profit Net" value={`${p.net_profit.toLocaleString()} DA`} icon={DollarSign} delay={0.1} />
            </div>

            {showAddForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="glass-card rounded-3xl p-6 border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Nouvelle Écriture</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Type</label>
                            <select value={newEntry.type} onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as FinanceType })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none">
                                <option value="expense">Dépense</option>
                                <option value="revenue">Revenu</option>
                                <option value="purchase">Achat</option>
                                <option value="payroll">Salaire</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Montant (DA)</label>
                            <input type="number" value={newEntry.amount || ''} onChange={(e) => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-primary/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Catégorie</label>
                            <input type="text" value={newEntry.category || ''} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-primary/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold">Description</label>
                            <input type="text" value={newEntry.description || ''} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:border-primary/50" />
                        </div>
                    </div>
                    <button onClick={handleAddEntry} className="bg-primary text-background px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                        Enregistrer
                    </button>
                </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Cash Flow Chart */}
                <div className="glass-card rounded-[2rem] p-8 border-white/5">
                    <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest mb-8">Flux de Trésorerie</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlow}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }}
                                    tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                                <Area type="monotone" dataKey="inflow" stroke="#22c55e" fill="rgba(34,197,94,0.1)" strokeWidth={2} name="Entrées" />
                                <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="rgba(239,68,68,0.1)" strokeWidth={2} name="Sorties" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* P&L by Category */}
                <div className="glass-card rounded-[2rem] p-8 border-white/5">
                    <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest mb-8">P&L par Catégorie</h3>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={p.by_category}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                                <Bar dataKey="amount" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Entries */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest">Écritures Récentes</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.03] border-b border-white/5">
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Catégorie</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Montant</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {entries.slice(0, 20).map(e => (
                                <tr key={e.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-3 text-[10px] text-muted-foreground font-mono-tech">{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-3"><span className={`text-[9px] font-bold uppercase tracking-widest ${e.type === 'revenue' ? 'text-emerald-500' : 'text-red-400'}`}>{e.type}</span></td>
                                    <td className="px-6 py-3 text-xs text-white">{e.category || '—'}</td>
                                    <td className="px-6 py-3"><span className={`text-sm font-mono-tech font-bold ${e.type === 'revenue' ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {e.type === 'revenue' ? '+' : '-'}{Number(e.amount).toLocaleString()} DA
                                    </span></td>
                                    <td className="px-6 py-3 text-[10px] text-muted-foreground">{e.description || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
