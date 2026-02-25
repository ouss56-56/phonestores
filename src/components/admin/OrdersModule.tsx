import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShoppingBag, Eye, Printer, ChevronRight, X, User } from "lucide-react";
import { orderBusiness } from "@/business/orderBusiness";
import { salesService } from "@/services/admin/salesService";
import { toast } from "sonner";
import { StatusBadge } from "./shared/StatusBadge";

export function OrdersModule() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [statusLogs, setStatusLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchOrders = async () => {
        try {
            const data = await salesService.getOrders(undefined, 100);
            setOrders(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Erreur lors du chargement des commandes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await orderBusiness.updateOrderStatus(orderId, newStatus);
            toast.success("Statut mis à jour");
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                const updated = await salesService.getOrderById(orderId);
                setSelectedOrder(updated);
                fetchStatusLogs(orderId);
            }
        } catch (e: any) {
            toast.error(e.message || "Erreur");
        }
    };

    const filteredOrders = orders.filter(o =>
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-admin-card p-6 rounded-3xl border border-admin-border shadow-sm">
                    <p className="text-[10px] font-bold text-admin-secondary uppercase tracking-widest mb-1">Total Commandes</p>
                    <p className="text-2xl font-bold text-admin-title">{orders.length}</p>
                </div>
                <div className="bg-admin-card p-6 rounded-3xl border border-admin-border shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">En Attente</p>
                    <p className="text-2xl font-bold text-admin-title">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="bg-admin-card p-6 rounded-3xl border border-admin-border shadow-sm">
                    <p className="text-[10px] font-bold text-admin-btn uppercase tracking-widest mb-1">En Cours</p>
                    <p className="text-2xl font-bold text-admin-title">{orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length}</p>
                </div>
                <div className="bg-admin-card p-6 rounded-3xl border border-admin-border shadow-sm">
                    <p className="text-[10px] font-bold text-admin-secondary uppercase tracking-widest mb-1">Livrées</p>
                    <p className="text-2xl font-bold text-admin-title">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-secondary" />
                    <input
                        type="text"
                        placeholder="Rechercher par N° ou client..."
                        className="w-full bg-admin-card border border-admin-border rounded-2xl py-3 pl-11 pr-4 text-xs text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-admin-card rounded-[2.5rem] border border-admin-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-admin-bg/50 border-b border-admin-border">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">N° Commande</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Client</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Montant</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Statut</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Date</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-admin-secondary italic text-xs">Aucune commande trouvée</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-admin-bg/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-admin-btn font-mono-tech">{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-admin-title">{order.customer_name}</div>
                                            <div className="text-[10px] text-admin-secondary font-medium uppercase tracking-tighter">{order.customer_phone || order.customer_email || 'Boutique'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-admin-primary font-mono-tech">{Number(order.total_amount).toLocaleString()} DA</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-5 text-[10px] text-admin-secondary font-mono-tech">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 rounded-xl bg-admin-bg border border-admin-border text-admin-secondary hover:text-admin-primary transition-all"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className="bg-admin-bg border border-admin-border text-[9px] font-bold text-admin-primary rounded-xl px-2 py-1 outline-none uppercase tracking-widest"
                                                >
                                                    <option value="pending">En attente</option>
                                                    <option value="confirmed">Confirmée</option>
                                                    <option value="processing">En cours</option>
                                                    <option value="shipped">Expédiée</option>
                                                    <option value="delivered">Livrée</option>
                                                    <option value="cancelled">Annulée</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-admin-border flex justify-between items-center bg-admin-bg/30">
                                <div>
                                    <p className="text-[10px] font-bold text-admin-btn uppercase tracking-[0.2em] mb-1">Détails de Commande</p>
                                    <h2 className="text-xl font-bold text-admin-title">{selectedOrder.order_number}</h2>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 rounded-2xl bg-white border border-admin-border text-admin-secondary hover:text-admin-primary">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                                {/* Client Info */}
                                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-admin-border">
                                    <div>
                                        <p className="text-[10px] font-bold text-admin-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <User className="w-3 h-3" /> Informations Client
                                        </p>
                                        <p className="text-sm font-bold text-admin-primary">{selectedOrder.customer_name}</p>
                                        <p className="text-xs text-admin-secondary">{selectedOrder.customer_phone}</p>
                                        <p className="text-xs text-admin-secondary">{selectedOrder.customer_email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-admin-secondary uppercase tracking-widest mb-3">Statut & Paiement</p>
                                        <div className="mb-2"><StatusBadge status={selectedOrder.status} /></div>
                                        <p className="text-xs font-bold text-admin-primary uppercase tracking-tighter">Méthode: {selectedOrder.payment_method}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <p className="text-[10px] font-bold text-admin-secondary uppercase tracking-widest mb-4">Articles</p>
                                    <div className="space-y-3">
                                        {selectedOrder.order_items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-admin-border bg-admin-bg/20">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-admin-border flex items-center justify-center shrink-0 overflow-hidden">
                                                    {item.products?.image_url ? (
                                                        <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Smartphone className="w-5 h-5 text-admin-secondary/20" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-admin-title">{item.products?.name}</p>
                                                    <p className="text-[10px] text-admin-secondary">{item.products?.brand} • {item.quantity} unité(s)</p>
                                                </div>
                                                <div className="text-xs font-bold text-admin-btn font-mono-tech">
                                                    {(item.unit_price * item.quantity).toLocaleString()} DA
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status History Timeline */}
                                <div className="pt-6 border-t border-admin-border">
                                    <p className="text-[10px] font-bold text-admin-secondary uppercase tracking-widest mb-6 px-1">Historique des statuts</p>
                                    <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-admin-border px-1">
                                        {loadingLogs ? (
                                            <div className="flex items-center gap-3 pl-8">
                                                <div className="w-3 h-3 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" />
                                                <span className="text-xs text-admin-secondary italic">Chargement...</span>
                                            </div>
                                        ) : statusLogs.length > 0 ? (
                                            statusLogs.map((log, idx) => (
                                                <div key={log.id} className="relative pl-8">
                                                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${idx === 0 ? "bg-admin-btn" : "bg-admin-secondary/30"
                                                        }`} />
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className={`text-[11px] font-bold uppercase tracking-tight ${idx === 0 ? "text-admin-title" : "text-admin-secondary"}`}>
                                                                {log.new_status}
                                                            </span>
                                                            <span className="text-[10px] text-admin-secondary font-mono-tech">
                                                                {new Date(log.created_at).toLocaleString('fr-FR')}
                                                            </span>
                                                        </div>
                                                        {log.note && (
                                                            <p className="text-[11px] text-admin-secondary/70 italic mt-0.5">"{log.note}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="relative pl-8 text-xs text-admin-secondary italic">Aucun historique disponible</div>
                                        )}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="p-6 rounded-3xl bg-admin-btn/5 border border-admin-btn/10 flex justify-between items-center">
                                    <div className="text-xs font-bold text-admin-btn uppercase tracking-widest italic">Total Commande</div>
                                    <div className="text-2xl font-bold text-admin-btn font-mono-tech">{Number(selectedOrder.total_amount).toLocaleString()} DA</div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-admin-border bg-admin-bg/30 flex justify-end gap-3">
                                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-admin-border bg-white text-xs font-bold text-admin-primary hover:bg-admin-bg transition-all">
                                    <Printer className="w-4 h-4" /> Imprimer
                                </button>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                                    className="bg-admin-btn text-white text-xs font-bold px-6 py-3 rounded-2xl outline-none shadow-lg shadow-black/10 transition-all uppercase tracking-widest"
                                >
                                    <option value="pending">En attente</option>
                                    <option value="confirmed">Confirmée</option>
                                    <option value="processing">En cours</option>
                                    <option value="shipped">Expédiée</option>
                                    <option value="delivered">Livrée</option>
                                    <option value="cancelled">Annulée</option>
                                </select>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
