import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, Smartphone, Clock, CheckCircle2, User, Search, Printer } from "lucide-react";
import { repairsService } from "@/services/admin/repairsService";
import { productsService } from "@/services/admin/productsService";
import { StatCard } from "./shared/StatCard";
import { StatusBadge } from "./shared/StatusBadge";
import type { Repair, Product } from "@/lib/admin-types";
import { toast } from "sonner";

export function RepairsModule() {
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [newRepair, setNewRepair] = useState<Partial<Repair>>({
        customer_name: '', customer_phone: '', device_brand: '', device_model: '', issue_description: '', status: 'received'
    });

    const loadData = async () => {
        try {
            const data = await repairsService.getAll();
            setRepairs(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        try {
            await repairsService.create(newRepair);
            toast.success("Réparation enregistrée");
            setShowAdd(false);
            setNewRepair({ customer_name: '', customer_phone: '', device_brand: '', device_model: '', issue_description: '', status: 'received' });
            loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    const handleUpdateStatus = async (id: string, status: any) => {
        try {
            await repairsService.updateStatus(id, status);
            toast.success("Statut mis à jour");
            loadData();
            if (selectedRepair?.id === id) {
                const updated = await repairsService.getById(id);
                setSelectedRepair(updated);
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const filtered = statusFilter === 'all' ? repairs : repairs.filter(r => r.status === statusFilter);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="En Cours" value={repairs.filter(r => ['received', 'diagnosing', 'waiting_parts', 'repairing'].includes(r.status)).length} icon={Wrench} delay={0} />
                <StatCard title="Prêtes" value={repairs.filter(r => r.status === 'ready').length} icon={CheckCircle2} delay={0.1} />
                <StatCard title="Livré (Total)" value={repairs.filter(r => r.status === 'delivered').length} icon={Smartphone} delay={0.2} />
                <StatCard title="CA Réparations" value={`${repairs.reduce((sum, r) => sum + Number(r.estimated_cost || 0), 0).toLocaleString()} DA`} icon={Clock} delay={0.3} />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* List Portion */}
                <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-center">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-admin-card border border-admin-border rounded-xl px-4 py-3 text-xs font-bold text-admin-primary outline-none focus:border-admin-secondary/40 transition-all uppercase tracking-widest shadow-sm">
                            <option value="all">Tous les Statuts</option>
                            <option value="received">Réceptionné</option>
                            <option value="diagnosing">Diagnostic</option>
                            <option value="repairing">En Réparation</option>
                            <option value="ready">Prêt</option>
                            <option value="delivered">Livré</option>
                        </select>
                        <button onClick={() => setShowAdd(!showAdd)} className="bg-admin-btn text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">
                            Nouvelle Fiche
                        </button>
                    </div>

                    {showAdd && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-admin-card p-8 border border-admin-border rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Nom Client</label>
                                <input type="text" placeholder="-- --- --" value={newRepair.customer_name} onChange={e => setNewRepair({ ...newRepair, customer_name: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-bold placeholder:font-normal" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Téléphone</label>
                                <input type="tel" placeholder="0X XX XX XX XX" value={newRepair.customer_phone} onChange={e => setNewRepair({ ...newRepair, customer_phone: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-mono-tech font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Marque</label>
                                <input type="text" placeholder="EX: Apple" value={newRepair.device_brand} onChange={e => setNewRepair({ ...newRepair, device_brand: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-bold placeholder:font-normal" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Modèle</label>
                                <input type="text" placeholder="EX: iPhone 15 Pro" value={newRepair.device_model} onChange={e => setNewRepair({ ...newRepair, device_model: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-bold placeholder:font-normal" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Description du problème</label>
                                <textarea placeholder="Écran fissuré, etc..." value={newRepair.issue_description} onChange={e => setNewRepair({ ...newRepair, issue_description: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-4 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-medium md:col-span-2" rows={3} />
                            </div>
                            <button onClick={handleCreate} className="bg-admin-btn text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest md:col-span-2 shadow-lg shadow-black/10 hover:scale-[1.01] transition-all active:scale-95">Créer la Fiche</button>
                        </motion.div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-5">
                        {filtered.map(r => (
                            <div key={r.id} onClick={() => setSelectedRepair(r)} className={`bg-admin-card p-6 border rounded-[2rem] shadow-sm cursor-pointer transition-all hover:shadow-soft group ${selectedRepair?.id === r.id ? 'border-admin-btn ring-1 ring-admin-btn/20' : 'border-admin-border hover:border-admin-secondary/40'}`}>
                                <div className="flex justify-between items-start mb-5">
                                    <span className="text-[10px] font-mono-tech text-admin-btn font-bold tracking-widest">{r.tracking_id}</span>
                                    <StatusBadge status={r.status} />
                                </div>
                                <h4 className="text-admin-title font-bold text-base mb-1.5 uppercase tracking-tight group-hover:text-admin-btn transition-colors">{r.device_brand} {r.device_model}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-admin-secondary font-bold uppercase tracking-widest mb-5">
                                    <User className="w-3.5 h-3.5" /> {r.customer_name}
                                </div>
                                <div className="text-[11px] text-admin-secondary font-medium line-clamp-2 bg-admin-bg p-3 rounded-2xl italic border border-admin-border">"{r.issue_description}"</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View Sidebar */}
                <div className="w-full lg:w-[450px]">
                    {selectedRepair ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-admin-card p-8 border border-admin-border rounded-[2.5rem] space-y-8 sticky top-8 shadow-sm">
                            <div className="flex justify-between items-center bg-admin-bg p-4 rounded-2xl border border-admin-border">
                                <h3 className="text-sm font-bold text-admin-title uppercase tracking-widest italic">Fiche technique</h3>
                                <button className="p-2.5 bg-admin-card border border-admin-border rounded-xl text-admin-secondary hover:text-admin-btn hover:bg-white transition-all shadow-sm"><Printer className="w-4.5 h-4.5" /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-admin-border">
                                <div>
                                    <p className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest mb-2.5">Status Actuel</p>
                                    <select value={selectedRepair.status} onChange={e => handleUpdateStatus(selectedRepair.id, e.target.value)} className="bg-admin-bg border border-admin-border rounded-xl p-3 text-xs font-bold text-admin-primary outline-none w-full uppercase tracking-tighter shadow-sm focus:border-admin-btn/40 transition-all">
                                        <option value="received">Réceptionné</option>
                                        <option value="diagnosing">Diagnostic</option>
                                        <option value="waiting_parts">Attente Pièces</option>
                                        <option value="repairing">Réparation</option>
                                        <option value="ready">Prêt</option>
                                        <option value="delivered">Livré</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest mb-2.5">Propriétaire</p>
                                    <p className="text-sm font-bold text-admin-title mb-1 uppercase tracking-tight">{selectedRepair.customer_name}</p>
                                    <p className="text-[10px] text-admin-secondary font-mono-tech font-bold">{selectedRepair.customer_phone}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <p className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Panne Signalée</p>
                                    <div className="bg-admin-bg p-5 rounded-[1.5rem] border border-admin-border text-xs font-medium text-admin-primary leading-relaxed italic border-l-[3px] border-l-admin-btn">"{selectedRepair.issue_description}"</div>
                                </div>

                                <div className="space-y-2.5">
                                    <p className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Rapport Technique</p>
                                    <textarea className="w-full bg-admin-bg border border-admin-border rounded-2xl p-5 text-xs text-admin-primary outline-none focus:border-admin-btn/40 transition-all font-medium placeholder:italic" rows={5} placeholder="Décrivez les réparations effectuées..." defaultValue={selectedRepair.technician_notes || ''} />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-admin-border">
                                <div className="flex justify-between items-center mb-6 bg-admin-bg p-5 rounded-2xl border border-admin-border">
                                    <span className="text-xs font-bold text-admin-secondary uppercase tracking-widest italic">Coût Estimé</span>
                                    <span className="text-2xl font-mono-tech font-bold text-admin-btn">{Number(selectedRepair.estimated_cost || 0).toLocaleString()} DA</span>
                                </div>
                                <button className="w-full bg-admin-btn text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all">Enregistrer le Rapport</button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-48 border border-dashed border-admin-border rounded-[2.5rem] flex items-center justify-center text-admin-secondary italic text-[10px] uppercase tracking-widest font-bold text-center px-10">
                            Sélectionnez une réparation pour gérer la fiche
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
