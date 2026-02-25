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
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-16rem)]">
                {/* Product Grid */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-secondary" />
                            <input type="text" placeholder="Scanner code-barres ou rechercher..."
                                className="w-full bg-admin-card border border-admin-border rounded-2xl py-5 pl-14 pr-6 text-admin-primary outline-none focus:border-admin-secondary/40 transition-all font-mono-tech shadow-sm placeholder:text-admin-secondary/50"
                                value={posSearch} onChange={(e) => setPosSearch(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredProducts.map((p, i) => (
                                <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    onClick={() => addToCart(p)}
                                    className="bg-admin-card p-6 rounded-[2rem] border border-admin-border hover:border-admin-secondary/40 transition-all text-left group relative overflow-hidden shadow-sm">
                                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-admin-btn/5 rounded-full blur-2xl group-hover:bg-admin-btn/10 transition-colors" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] text-admin-btn font-bold uppercase tracking-widest">{p.brand}</span>
                                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-200">{p.quantity} en stock</span>
                                        </div>
                                        <div className="text-base font-bold text-admin-title mb-2 line-clamp-1 group-hover:text-admin-btn transition-colors">{p.name}</div>
                                        <div className="text-[10px] text-admin-secondary font-mono-tech mb-6">{p.sku}</div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-[9px] text-admin-secondary uppercase font-bold tracking-tighter">Prix de vente</div>
                                                <div className="text-xl font-mono-tech font-bold text-admin-title">{p.selling_price.toLocaleString()} DA</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-admin-border flex items-center justify-center group-hover:bg-admin-btn group-hover:text-white group-hover:border-admin-btn transition-all">
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
                <div className="bg-admin-card rounded-[2.5rem] border border-admin-border flex flex-col relative overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-admin-border">
                        <h3 className="font-heading font-bold text-admin-title flex items-center gap-3 uppercase tracking-widest italic mb-4">
                            <Calculator className="w-5 h-5 text-admin-btn" /> Session POS
                        </h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Nom du client" value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-admin-bg border border-admin-border rounded-xl py-3 px-4 text-xs text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            <input type="text" placeholder="Téléphone (optionnel)" value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full bg-admin-bg border border-admin-border rounded-xl py-3 px-4 text-xs text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-admin-bg border border-admin-border rounded-xl py-3 px-4 text-xs text-admin-primary outline-none focus:border-admin-secondary/40 transition-all">
                                <option value="cash">Espèces</option>
                                <option value="card">Carte</option>
                                <option value="transfer">Virement</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {posCart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-admin-secondary italic opacity-40 text-center px-10">
                                <ShoppingBag className="w-12 h-12 mb-4" />
                                <p className="text-sm font-heading font-bold uppercase tracking-widest">Panier vide</p>
                            </div>
                        ) : (
                            posCart.map(item => (
                                <motion.div key={item.id} layout className="flex justify-between items-center group bg-admin-bg p-4 rounded-2xl border border-admin-border hover:border-admin-secondary/20 transition-all">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-admin-title">{item.name}</div>
                                        <div className="text-[9px] text-admin-secondary font-mono-tech">{item.sku} × {item.cartQty}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs font-bold text-admin-btn font-mono-tech">{(item.selling_price * item.cartQty).toLocaleString()} DA</div>
                                        <button onClick={() => removeFromCart(item.id)}
                                            className="bg-rose-50 text-rose-500 p-2 rounded-lg border border-rose-100 hover:bg-rose-100 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-admin-bg/50 border-t border-admin-border backdrop-blur-xl">
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-admin-secondary">Sous-total</span>
                                <span className="font-mono-tech text-sm font-bold text-admin-primary">{subtotal.toLocaleString()} DA</span>
                            </div>
                            <div className="h-px bg-admin-border/50" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-admin-title uppercase tracking-widest italic">Total</span>
                                <span className="text-2xl font-mono-tech font-bold text-admin-btn">{subtotal.toLocaleString()} DA</span>
                            </div>
                        </div>
                        <button disabled={posCart.length === 0} onClick={handleCompleteSale}
                            className="w-full bg-admin-btn text-white py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:scale-100">
                            <Printer className="w-5 h-5" />
                            <span className="uppercase tracking-widest">Valider & Imprimer</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
