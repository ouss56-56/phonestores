import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Calculator, ShoppingBag, Trash2, Plus, Printer } from "lucide-react";
import { productsService } from "@/services/admin/productsService";
import { salesService } from "@/services/admin/salesService";
import { exportService } from "@/services/admin/exportService";
import type { Product } from "@/lib/admin-types";
import { toast } from "sonner";
import { StatusBadge } from "./shared/StatusBadge";

export function SalesModule() {
    const [products, setProducts] = useState<Product[]>([]);
    const [posCart, setPosCart] = useState<(Product & { cartQty: number })[]>([]);
    const [posSearch, setPosSearch] = useState("");
    const [customerName, setCustomerName] = useState("Client Comptoir");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [orders, setOrders] = useState<any[]>([]);
    const [view, setView] = useState<'pos' | 'orders'>('pos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [prods, ords] = await Promise.all([
                    productsService.getAll(),
                    salesService.getOrders(undefined, 50),
                ]);
                setProducts(prods);
                setOrders(ords || []);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, []);

    const filteredProducts = products.filter(p =>
        p.is_active && p.quantity > 0 &&
        (p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
            p.sku?.toLowerCase().includes(posSearch.toLowerCase()) ||
            p.barcode?.toLowerCase().includes(posSearch.toLowerCase()))
    );

    const addToCart = (product: Product) => {
        const existing = posCart.find(c => c.id === product.id);
        if (existing) {
            if (existing.cartQty >= product.quantity) {
                toast.error("Stock insuffisant");
                return;
            }
            setPosCart(posCart.map(c => c.id === product.id ? { ...c, cartQty: c.cartQty + 1 } : c));
        } else {
            setPosCart([...posCart, { ...product, cartQty: 1 }]);
        }
    };

    const removeFromCart = (productId: string) => {
        setPosCart(posCart.filter(c => c.id !== productId));
    };

    const subtotal = posCart.reduce((sum, item) => sum + (item.selling_price * item.cartQty), 0);

    const handleCompleteSale = async () => {
        if (posCart.length === 0) return;
        try {
            const order = await salesService.createPOSSale({
                customer_name: customerName,
                customer_phone: customerPhone || undefined,
                items: posCart.map(item => ({
                    product_id: item.id,
                    quantity: item.cartQty,
                    unit_price: item.selling_price,
                })),
                payment_method: paymentMethod,
            });

            // Generate invoice
            exportService.generateInvoicePDF({
                orderNumber: order.order_number || order.pos_reference,
                customerName,
                items: posCart.map(item => ({ name: item.name, quantity: item.cartQty, unit_price: item.selling_price })),
                totalAmount: subtotal,
                paymentMethod,
            });

            toast.success(`Vente enregistrée: ${order.order_number}`);
            setPosCart([]);
            setPosSearch("");
            setCustomerName("Client Comptoir");
            setCustomerPhone("");

            // Refresh products and orders
            const [prods, ords] = await Promise.all([
                productsService.getAll(),
                salesService.getOrders(undefined, 50),
            ]);
            setProducts(prods);
            setOrders(ords || []);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur lors de la vente");
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await salesService.updateOrderStatus(orderId, newStatus as any);
            toast.success("Statut mis à jour");
            const ords = await salesService.getOrders(undefined, 50);
            setOrders(ords || []);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* View Toggle */}
            <div className="flex gap-3">
                <button onClick={() => setView('pos')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'pos' ? 'bg-primary text-background' : 'glass border border-white/10 text-white hover:bg-white/10'}`}>
                    <Calculator className="w-4 h-4 inline mr-2" /> Point de Vente
                </button>
                <button onClick={() => setView('orders')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'orders' ? 'bg-primary text-background' : 'glass border border-white/10 text-white hover:bg-white/10'}`}>
                    <ShoppingBag className="w-4 h-4 inline mr-2" /> Commandes ({orders.length})
                </button>
            </div>

            {view === 'pos' ? (
                <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-16rem)]">
                    {/* Product Grid */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input type="text" placeholder="Scanner code-barres ou rechercher..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-primary/50 transition-all font-mono-tech shadow-inner"
                                    value={posSearch} onChange={(e) => setPosSearch(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredProducts.map((p, i) => (
                                    <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => addToCart(p)}
                                        className="glass-card p-6 rounded-[2rem] border-white/5 hover:border-primary/40 transition-all text-left group relative overflow-hidden">
                                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{p.brand}</span>
                                                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{p.quantity} en stock</span>
                                            </div>
                                            <div className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono-tech mb-6">{p.sku}</div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="text-[9px] text-muted-foreground uppercase font-bold">Prix de vente</div>
                                                    <div className="text-xl font-mono-tech font-bold text-white">{p.selling_price.toLocaleString()} DA</div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-background group-hover:border-primary transition-all">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="glass-card rounded-[2.5rem] border-white/5 flex flex-col relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-heading font-bold text-white flex items-center gap-3 uppercase tracking-widest italic mb-4">
                                <Calculator className="w-5 h-5 text-primary" /> Session POS
                            </h3>
                            <div className="space-y-2">
                                <input type="text" placeholder="Nom du client" value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-primary/50" />
                                <input type="text" placeholder="Téléphone (optionnel)" value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-primary/50" />
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none">
                                    <option value="cash">Espèces</option>
                                    <option value="card">Carte</option>
                                    <option value="transfer">Virement</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {posCart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic opacity-30 text-center px-10">
                                    <ShoppingBag className="w-12 h-12 mb-4" />
                                    <p className="text-sm font-heading font-bold uppercase tracking-widest">Panier vide</p>
                                </div>
                            ) : (
                                posCart.map(item => (
                                    <motion.div key={item.id} layout className="flex justify-between items-center group bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-white">{item.name}</div>
                                            <div className="text-[9px] text-muted-foreground font-mono-tech">{item.sku} × {item.cartQty}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs font-bold text-primary font-mono-tech">{(item.selling_price * item.cartQty).toLocaleString()} DA</div>
                                            <button onClick={() => removeFromCart(item.id)}
                                                className="bg-red-500/10 text-red-400 p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/20 transition-all">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-[#FAFAFA]/95 border-t border-black/5 backdrop-blur-xl">
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sous-total</span>
                                    <span className="font-mono-tech text-sm text-white">{subtotal.toLocaleString()} DA</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white uppercase tracking-widest italic">Total</span>
                                    <span className="text-2xl font-mono-tech font-bold text-primary">{subtotal.toLocaleString()} DA</span>
                                </div>
                            </div>
                            <button disabled={posCart.length === 0} onClick={handleCompleteSale}
                                className="w-full bg-primary text-background py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:scale-100">
                                <Printer className="w-5 h-5" />
                                <span className="uppercase tracking-widest">Valider & Imprimer</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Orders List */
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/[0.03] border-b border-white/5">
                                    <th className="text-left px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">N° Commande</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Client</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Montant</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                                    <th className="text-left px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono-tech text-primary font-bold">{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-white">{order.customer_name}</div>
                                            <div className="text-[10px] text-muted-foreground">{order.customer_phone || order.customer_email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono-tech font-bold text-white">{Number(order.total_amount).toLocaleString()} DA</span>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${order.is_pos_sale ? 'text-primary' : 'text-blue-400'}`}>
                                                {order.is_pos_sale ? 'POS' : 'Online'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] text-muted-foreground font-mono-tech">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 text-[10px] text-white px-2 py-1 rounded-lg outline-none">
                                                    <option value="pending">En attente</option>
                                                    <option value="confirmed">Confirmée</option>
                                                    <option value="processing">En cours</option>
                                                    <option value="shipped">Expédiée</option>
                                                    <option value="delivered">Livrée</option>
                                                    <option value="cancelled">Annulée</option>
                                                </select>
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
