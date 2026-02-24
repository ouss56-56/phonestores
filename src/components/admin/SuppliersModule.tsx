import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Plus, Mail, Phone, MapPin, ListChecks, ArrowRight } from "lucide-react";
import { suppliersService } from "@/services/admin/suppliersService";
import { productsService } from "@/services/admin/productsService";
import { StatCard } from "./shared/StatCard";
import { StatusBadge } from "./shared/StatusBadge";
import type { Supplier, PurchaseOrder, Product } from "@/lib/admin-types";
import { toast } from "sonner";

export function SuppliersModule() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [pos, setPos] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'pos'>('list');
    const [showAddSupplier, setShowAddSupplier] = useState(false);
    const [showCreatePO, setShowCreatePO] = useState(false);
    const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ name: '', is_active: true });
    const [newPO, setNewPO] = useState<{ supplier_id: string; items: { product_id: string; quantity: number; unit_cost: number }[] }>({
        supplier_id: '',
        items: []
    });

    const loadData = async () => {
        try {
            const [s, pords, prods] = await Promise.all([
                suppliersService.getAll(),
                suppliersService.getPurchaseOrders(),
                productsService.getAll(),
            ]);
            setSuppliers(s);
            setPos(pords);
            setProducts(prods);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateSupplier = async () => {
        try {
            await suppliersService.create(newSupplier);
            toast.success("Fournisseur ajouté");
            setShowAddSupplier(false);
            setNewSupplier({ name: '', is_active: true });
            loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    const handleCreatePO = async () => {
        if (!newPO.supplier_id || newPO.items.length === 0) return;
        try {
            await suppliersService.createPO(newPO);
            toast.success("Bon de commande créé");
            setShowCreatePO(false);
            setNewPO({ supplier_id: '', items: [] });
            loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    const handleReceivePO = async (id: string) => {
        try {
            await suppliersService.receivePO(id);
            toast.success("Commande reçue et stock mis à jour");
            loadData();
        } catch (e: any) { toast.error(e.message); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex gap-3">
                <button onClick={() => setView('list')}
                    className={`px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${view === 'list' ? 'bg-admin-btn text-white shadow-lg shadow-black/10' : 'bg-admin-card border border-admin-border text-admin-primary hover:bg-admin-bg'}`}>
                    <Truck className="w-4 h-4 inline mr-2" /> Fournisseurs
                </button>
                <button onClick={() => setView('pos')}
                    className={`px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${view === 'pos' ? 'bg-admin-btn text-white shadow-lg shadow-black/10' : 'bg-admin-card border border-admin-border text-admin-primary hover:bg-admin-bg'}`}>
                    <ListChecks className="w-4 h-4 inline mr-2" /> Bons de Commande
                </button>
            </div>

            {view === 'list' ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-admin-card/50 p-6 rounded-[2rem] border border-admin-border shadow-sm">
                        <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest italic">Gestion des Fournisseurs</h3>
                        <button onClick={() => setShowAddSupplier(!showAddSupplier)}
                            className="bg-admin-btn text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">
                            <Plus className="w-4 h-4 inline mr-2" /> Nouveau Fournisseur
                        </button>
                    </div>

                    {showAddSupplier && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-admin-card p-10 border border-admin-border rounded-[2.5rem] space-y-8 shadow-soft">
                            <h4 className="text-sm font-bold text-admin-title uppercase tracking-widest italic border-b border-admin-border pb-4">Ajouter un partenaire</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1.5 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                                    <label className="ml-1">Nom Entreprise</label>
                                    <input type="text" placeholder="SARL ..." value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3.5 text-sm text-admin-primary outline-none focus:border-admin-btn/40 transition-all shadow-sm placeholder:font-normal" />
                                </div>
                                <div className="space-y-1.5 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                                    <label className="ml-1">Contact Principal</label>
                                    <input type="text" placeholder="Nom Prénom" value={newSupplier.contact_name} onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3.5 text-sm text-admin-primary outline-none focus:border-admin-btn/40 transition-all shadow-sm placeholder:font-normal" />
                                </div>
                                <div className="space-y-1.5 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                                    <label className="ml-1">Email Professionnel</label>
                                    <input type="email" placeholder="contact@example.dz" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3.5 text-sm text-admin-primary outline-none focus:border-admin-btn/40 transition-all shadow-sm font-bold lowercase placeholder:font-normal" />
                                </div>
                                <div className="space-y-1.5 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                                    <label className="ml-1">Numéro Téléphone</label>
                                    <input type="tel" placeholder="0X XX XX XX XX" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3.5 text-sm text-admin-primary outline-none focus:border-admin-btn/40 transition-all shadow-sm font-mono-tech" />
                                </div>
                                <div className="space-y-1.5 font-bold uppercase tracking-widest text-[9px] text-admin-secondary lg:col-span-2">
                                    <label className="ml-1">Adresse Siège</label>
                                    <input type="text" placeholder=" Rue ..., Ville, Pays" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-3.5 text-sm text-admin-primary outline-none focus:border-admin-btn/40 transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowAddSupplier(false)} className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-admin-secondary border border-admin-border hover:bg-admin-bg transition-all">Annuler</button>
                                <button onClick={handleCreateSupplier} className="bg-admin-btn text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-all">Confirmer le Partenariat</button>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suppliers.map(s => (
                            <div key={s.id} className="bg-admin-card p-8 border border-admin-border rounded-[2.5rem] shadow-sm hover:shadow-soft hover:border-admin-secondary/20 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="text-xl font-bold text-admin-title italic tracking-tight uppercase group-hover:text-admin-btn transition-colors">{s.name}</h4>
                                    <StatusBadge status={s.is_active ? 'active' : 'inactive'} />
                                </div>
                                <div className="space-y-3.5 border-t border-admin-border pt-6">
                                    <div className="flex items-center gap-3 text-xs font-medium text-admin-primary"><Mail className="w-4 h-4 text-admin-secondary" /> <span className="lowercase">{s.email || '—'}</span></div>
                                    <div className="flex items-center gap-3 text-xs font-mono-tech font-bold text-admin-primary"><Phone className="w-4 h-4 text-admin-secondary" /> {s.phone || '—'}</div>
                                    <div className="flex items-center gap-3 text-[11px] font-medium text-admin-secondary"><MapPin className="w-4 h-4" /> {s.address || '—'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-admin-card/50 p-6 rounded-[2rem] border border-admin-border shadow-sm">
                        <h3 className="text-lg font-heading font-bold text-admin-title uppercase tracking-widest italic">Suivi des Approvisionnements</h3>
                        <button onClick={() => setShowCreatePO(!showCreatePO)}
                            className="bg-admin-btn text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">
                            <Plus className="w-4 h-4 inline mr-2" /> Nouveau Bon de Commande
                        </button>
                    </div>

                    {showCreatePO && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-admin-card p-10 border border-admin-border rounded-[2.5rem] space-y-8 shadow-soft">
                            <div className="space-y-2 font-bold uppercase tracking-widest text-[9px] text-admin-secondary">
                                <label className="ml-1">Sélectionner un fournisseur</label>
                                <select value={newPO.supplier_id} onChange={e => setNewPO({ ...newPO, supplier_id: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl p-4 text-sm font-bold text-admin-title shadow-sm outline-none focus:border-admin-btn/40 transition-all">
                                    <option value="" className="font-normal italic">-- Choisir un partenaire --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="bg-admin-bg/50 p-8 rounded-3xl border border-admin-border space-y-6">
                                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-secondary italic">Articles de la commande</h5>
                                {newPO.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-admin-border shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
                                        <div className="font-bold text-sm text-admin-title">{products.find(p => p.id === item.product_id)?.name}</div>
                                        <div className="flex items-center gap-8 text-[11px] font-mono-tech font-bold uppercase">
                                            <span className="text-admin-secondary">Qté: <span className="text-admin-btn">{item.quantity}</span></span>
                                            <span className="text-admin-secondary">Prix: <span className="text-admin-btn">{item.unit_cost.toLocaleString()} DA</span></span>
                                        </div>
                                    </div>
                                ))}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-admin-card p-6 rounded-2xl border border-admin-border shadow-soft">
                                    <select id="po-prod" className="bg-white border border-admin-border rounded-xl p-3 text-xs font-bold text-admin-title md:col-span-2 outline-none focus:border-admin-btn/40 transition-all">
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>)}
                                    </select>
                                    <input id="po-qty" type="number" placeholder="Quantité" className="bg-white border border-admin-border rounded-xl p-3 text-xs font-bold text-admin-primary outline-none focus:border-admin-btn/40" />
                                    <div className="flex gap-2">
                                        <input id="po-cost" type="number" placeholder="Coût (DA)" className="bg-white border border-admin-border rounded-xl p-3 text-xs font-bold text-admin-primary flex-1 outline-none focus:border-admin-btn/40" />
                                        <button onClick={() => {
                                            const pid = (document.getElementById('po-prod') as HTMLSelectElement).value;
                                            const qty = parseInt((document.getElementById('po-qty') as HTMLInputElement).value);
                                            const cost = parseFloat((document.getElementById('po-cost') as HTMLInputElement).value);
                                            if (pid && qty && cost) {
                                                setNewPO({ ...newPO, items: [...newPO.items, { product_id: pid, quantity: qty, unit_cost: cost }] });
                                            }
                                        }} className="bg-admin-btn text-white p-3 rounded-xl shadow-lg shadow-black/10 hover:scale-110 active:scale-90 transition-all duration-300"><Plus className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowCreatePO(false)} className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-admin-secondary border border-admin-border hover:bg-admin-bg transition-all">Abandonner</button>
                                <button onClick={handleCreatePO} className="bg-admin-btn text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-all">Générer le Bon de Commande</button>
                            </div>
                        </motion.div>
                    )}

                    <div className="bg-admin-card rounded-[2.5rem] overflow-hidden border border-admin-border shadow-sm">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-admin-bg/50 border-b border-admin-border text-[10px] font-bold text-admin-secondary uppercase tracking-widest text-left">
                                        <th className="px-8 py-6">Référence</th>
                                        <th className="px-8 py-6">Fournisseur</th>
                                        <th className="px-8 py-6">Total HT</th>
                                        <th className="px-8 py-6">Statut</th>
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {pos.map(po => (
                                        <tr key={po.id} className="text-sm text-admin-primary hover:bg-admin-bg/30 transition-colors group">
                                            <td className="px-8 py-5 font-mono-tech font-bold text-admin-btn italic tracking-widest uppercase">{po.po_number}</td>
                                            <td className="px-8 py-5 font-bold text-admin-title uppercase tracking-tighter">{po.suppliers?.name}</td>
                                            <td className="px-8 py-5 font-mono-tech font-bold text-admin-title">{Number(po.total_amount).toLocaleString()} DA</td>
                                            <td className="px-8 py-5"><StatusBadge status={po.status} /></td>
                                            <td className="px-8 py-5 text-[10px] text-admin-secondary font-bold uppercase tracking-widest">{new Date(po.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-8 py-5 text-right">
                                                {po.status !== 'received' ? (
                                                    <button onClick={() => handleReceivePO(po.id)} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:shadow-lg transition-all shadow-sm">Réceptionner →</button>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-admin-secondary uppercase tracking-[0.2em] italic pr-4">Complété</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
