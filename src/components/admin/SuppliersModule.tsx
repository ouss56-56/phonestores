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
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex gap-3">
                <button onClick={() => setView('list')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-primary text-background' : 'glass border border-white/10 text-white hover:bg-white/10'}`}>
                    Fournisseurs
                </button>
                <button onClick={() => setView('pos')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'pos' ? 'bg-primary text-background' : 'glass border border-white/10 text-white hover:bg-white/10'}`}>
                    Bons de Commande
                </button>
            </div>

            {view === 'list' ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest">Liste des Fournisseurs</h3>
                        <button onClick={() => setShowAddSupplier(!showAddSupplier)}
                            className="bg-primary text-background px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                            Nouveau Fournisseur
                        </button>
                    </div>

                    {showAddSupplier && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-white/5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input type="text" placeholder="Nom du fournisseur" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                                <input type="text" placeholder="Contact" value={newSupplier.contact_name} onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                                <input type="email" placeholder="Email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                                <input type="tel" placeholder="Téléphone" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                                <input type="text" placeholder="Adresse" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" />
                            </div>
                            <button onClick={handleCreateSupplier} className="bg-primary text-background px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Enregistrer</button>
                        </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suppliers.map(s => (
                            <div key={s.id} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-bold text-white">{s.name}</h4>
                                    <StatusBadge status={s.is_active ? 'active' : 'inactive'} />
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {s.email || 'N/A'}</div>
                                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {s.phone || 'N/A'}</div>
                                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {s.address || 'N/A'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-heading font-bold text-white uppercase tracking-widest">Bons de Commande</h3>
                        <button onClick={() => setShowCreatePO(!showCreatePO)}
                            className="bg-primary text-background px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                            Nouveau Bon (PO)
                        </button>
                    </div>

                    {showCreatePO && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border-white/5 space-y-4">
                            <select value={newPO.supplier_id} onChange={e => setNewPO({ ...newPO, supplier_id: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white w-full">
                                <option value="">Sélectionner un fournisseur</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {/* Simple PO item adder */}
                            <div className="space-y-2">
                                {newPO.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 text-xs text-white">
                                        <span>{products.find(p => p.id === item.product_id)?.name}</span>
                                        <span>x{item.quantity}</span>
                                        <span>{item.unit_cost} DA</span>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <select id="po-prod" className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white flex-1">
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <input id="po-qty" type="number" placeholder="Qté" className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white w-20" />
                                    <input id="po-cost" type="number" placeholder="Coût" className="bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white w-24" />
                                    <button onClick={() => {
                                        const pid = (document.getElementById('po-prod') as HTMLSelectElement).value;
                                        const qty = parseInt((document.getElementById('po-qty') as HTMLInputElement).value);
                                        const cost = parseFloat((document.getElementById('po-cost') as HTMLInputElement).value);
                                        if (pid && qty && cost) {
                                            setNewPO({ ...newPO, items: [...newPO.items, { product_id: pid, quantity: qty, unit_cost: cost }] });
                                        }
                                    }} className="bg-white/10 p-2 rounded-xl"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <button onClick={handleCreatePO} className="bg-primary text-background px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">Confirmer PO</button>
                        </motion.div>
                    )}

                    <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">
                                    <th className="px-6 py-4">N° PO</th>
                                    <th className="px-6 py-4">Fournisseur</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pos.map(po => (
                                    <tr key={po.id} className="text-sm text-white hover:bg-white/[0.01]">
                                        <td className="px-6 py-4 font-mono-tech text-primary">{po.po_number}</td>
                                        <td className="px-6 py-4">{po.suppliers?.name}</td>
                                        <td className="px-6 py-4 font-mono-tech">{Number(po.total_amount).toLocaleString()} DA</td>
                                        <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(po.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {po.status !== 'received' && (
                                                <button onClick={() => handleReceivePO(po.id)} className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter hover:bg-emerald-500/20">Réceptionner</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
