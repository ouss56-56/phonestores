import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Phone, Mail, ShoppingBag, History, Star, Search } from "lucide-react";
import { customersService } from "@/services/admin/customersService";
import { StatCard } from "./shared/StatCard";
import { StatusBadge } from "./shared/StatusBadge";
import { SearchBar } from "./shared/SearchBar";
import type { Customer } from "@/lib/admin-types";
import { toast } from "sonner";

export function CustomersModule() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const data = await customersService.getAll();
            setCustomers(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const viewHistory = async (customer: Customer) => {
        try {
            const h = await customersService.getOrderHistory(customer.id);
            setHistory(h || []);
            setSelectedCustomer(customer);
        } catch (e) { toast.error("Erreur historique"); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Clients" value={customers.length} icon={Users} delay={0} />
                <StatCard title="Clients VIP" value={customers.filter(c => c.segment === 'vip').length} icon={Star} delay={0.1} />
                <StatCard title="Nouveaux (30j)" value={customers.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 86400000)).length} icon={UserPlus} delay={0.2} />
                <StatCard title="Chiffre d'Affaire" value={`${customers.reduce((sum, c) => sum + Number(c.total_spent), 0).toLocaleString()} DA`} icon={History} delay={0.3} />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Customer List */}
                <div className="flex-1 space-y-4">
                    <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, téléphone..." />
                    <div className="bg-admin-card rounded-[2.5rem] overflow-hidden border border-admin-border shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-admin-bg/50 border-b border-admin-border text-[10px] font-bold text-admin-secondary uppercase tracking-widest text-left">
                                    <th className="px-6 py-5">Client</th>
                                    <th className="px-6 py-5">Contact</th>
                                    <th className="px-6 py-5">Segment</th>
                                    <th className="px-6 py-5">Points</th>
                                    <th className="px-6 py-5">Dépenses</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {filtered.map(c => (
                                    <tr key={c.id} onClick={() => viewHistory(c)} className={`text-sm text-admin-primary hover:bg-admin-bg/50 cursor-pointer transition-colors ${selectedCustomer?.id === c.id ? 'bg-admin-bg' : ''}`}>
                                        <td className="px-6 py-5 font-bold text-admin-title">{c.name}</td>
                                        <td className="px-6 py-5 text-[11px] text-admin-secondary font-medium uppercase tracking-tight">
                                            <div>{c.phone}</div>
                                            <div className="lowercase">{c.email}</div>
                                        </td>
                                        <td className="px-6 py-5"><StatusBadge status={c.segment} /></td>
                                        <td className="px-6 py-5 font-mono-tech font-bold text-admin-primary">{c.loyalty_points}</td>
                                        <td className="px-6 py-5 font-mono-tech font-bold text-admin-btn">{Number(c.total_spent).toLocaleString()} DA</td>
                                        <td className="px-6 py-5"><Search className="w-4 h-4 text-admin-secondary" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Detail / History */}
                <div className="w-full lg:w-96 space-y-4">
                    {selectedCustomer ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-admin-card p-8 border border-admin-border rounded-[2.5rem] space-y-8 sticky top-8 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-admin-title mb-1.5">{selectedCustomer.name}</h3>
                                <p className="text-[10px] text-admin-secondary uppercase tracking-widest font-bold">Historique du Client</p>
                            </div>

                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <p className="text-center py-10 text-admin-secondary italic text-[10px] uppercase font-bold tracking-widest border border-dashed border-admin-border rounded-2xl">Aucun achat enregistré</p>
                                ) : (
                                    history.map(order => (
                                        <div key={order.id} className="bg-admin-bg rounded-2xl p-5 border border-admin-border hover:border-admin-secondary/20 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-mono-tech font-bold text-admin-btn">{order.order_number}</span>
                                                <span className="text-[10px] text-admin-secondary font-mono-tech font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-base font-bold text-admin-title mb-3 font-mono-tech">{Number(order.total_amount).toLocaleString()} DA</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {order.order_items?.map((item: any, idx: number) => (
                                                    <span key={idx} className="bg-admin-card border border-admin-border px-3 py-1 rounded-lg text-[9px] font-bold text-admin-secondary uppercase tracking-widest">{item.products?.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-48 border border-dashed border-admin-border rounded-[2.5rem] flex items-center justify-center text-admin-secondary italic text-[10px] uppercase tracking-widest font-bold text-center px-10">
                            Sélectionnez un client pour voir les détails
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
