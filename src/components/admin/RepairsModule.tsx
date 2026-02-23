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
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
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
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none">
                            <option value="all">Tous les Statuts</option>
                            <option value="received">Réceptionné</option>
                            <option value="diagnosing">Diagnostic</option>
                            <option value="repairing">En Réparation</option>
                            <option value="ready">Prêt</option>
                            <option value="delivered">Livré</option>
                        </select>
                        <button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-background px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all outline-none">
                            Nouvelle Fiche
                        </button>
                    </div>

                    {showAdd && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nom Client" value={newRepair.customer_name} onChange={e => setNewRepair({ ...newRepair, customer_name: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            <input type="tel" placeholder="Téléphone" value={newRepair.customer_phone} onChange={e => setNewRepair({ ...newRepair, customer_phone: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            <input type="text" placeholder="Marque" value={newRepair.device_brand} onChange={e => setNewRepair({ ...newRepair, device_brand: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            <input type="text" placeholder="Modèle" value={newRepair.device_model} onChange={e => setNewRepair({ ...newRepair, device_model: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            <textarea placeholder="Problème" value={newRepair.issue_description} onChange={e => setNewRepair({ ...newRepair, issue_description: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white md:col-span-2" rows={3} />
                            <button onClick={handleCreate} className="bg-primary text-background px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest md:col-span-2">Créer la Fiche</button>
                        </motion.div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        {filtered.map(r => (
                            <div key={r.id} onClick={() => setSelectedRepair(r)} className={`glass-card p-5 border shadow-xl cursor-pointer transition-all ${selectedRepair?.id === r.id ? 'border-primary/50 bg-white/[0.04]' : 'border-white/5 hover:border-white/10'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-mono-tech text-primary font-bold">{r.tracking_id}</span>
                                    <StatusBadge status={r.status} />
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">{r.device_brand} {r.device_model}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4">
                                    <User className="w-3 h-3" /> {r.customer_name}
                                </div>
                                <div className="text-[11px] text-muted-foreground line-clamp-2 bg-black/20 p-2 rounded-lg italic">"{r.issue_description}"</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail View Sidebar */}
                <div className="w-full lg:w-[400px]">
                    {selectedRepair ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 border-white/5 space-y-8 sticky top-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white italic uppercase tracking-widest">Détails Fiche</h3>
                                <button className="p-2 bg-white/5 rounded-lg text-muted-foreground hover:text-white"><Printer className="w-4 h-4" /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5">
                                <div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status Actuel</p>
                                    <select value={selectedRepair.status} onChange={e => handleUpdateStatus(selectedRepair.id, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none w-full">
                                        <option value="received">Réceptionné</option>
                                        <option value="diagnosing">Diagnostic</option>
                                        <option value="waiting_parts">Attente Pièces</option>
                                        <option value="repairing">Réparation</option>
                                        <option value="ready">Prêt</option>
                                        <option value="delivered">Livré</option>
                                    </select>
                                </div>
                                <div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Propriétaire</p>
                                    <p className="text-xs font-bold text-white">{selectedRepair.customer_name}</p>
                                    <p className="text-[10px] text-muted-foreground">{selectedRepair.customer_phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Description Panne</p>
                                <div className="bg-white/5 p-4 rounded-2xl text-xs text-white leading-relaxed">{selectedRepair.issue_description}</div>

                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Notes Technicien</p>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary/50" rows={4} placeholder="Ajouter une observation..." defaultValue={selectedRepair.technician_notes || ''} />
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest italic">Coût Estimé</span>
                                    <span className="text-xl font-mono-tech font-bold text-primary">{Number(selectedRepair.estimated_cost || 0).toLocaleString()} DA</span>
                                </div>
                                <button className="w-full bg-white/5 border border-white/10 py-3 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10">Enregistrer les Notes</button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-48 border border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center text-muted-foreground italic text-xs uppercase tracking-widest text-center px-10">
                            Sélectionnez une réparation pour gérer la fiche
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
