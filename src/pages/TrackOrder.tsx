import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, AlertCircle, Clock, ChevronRight, MapPin } from "lucide-react";
import { orderBusiness } from "@/business/orderBusiness";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

interface StatusLog {
    id: string;
    new_status: string;
    note: string | null;
    created_at: string;
}

export default function TrackOrder() {
    const { t } = useI18n();
    const [orderNumber, setOrderNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<any>(null);
    const [logs, setLogs] = useState<StatusLog[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;

        setLoading(true);
        setError(null);
        setOrder(null);
        setLogs([]);

        try {
            const data = await orderBusiness.getOrderByNumber(orderNumber.trim());
            if (!data) {
                setError("Commande introuvable. Vérifiez le numéro.");
            } else {
                setOrder(data);
                // Fetch status logs
                const { data: statusLogs } = await supabase
                    .from('order_status_logs')
                    .select('*')
                    .eq('order_id', data.id)
                    .order('created_at', { ascending: false });

                setLogs(statusLogs || []);
            }
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors de la recherche.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
            case 'shipped': return <Truck className="w-5 h-5 text-indigo-500" />;
            case 'delivered': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'cancelled': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return "En attente";
            case 'processing': return "En préparation";
            case 'shipped': return "Expédiée";
            case 'delivered': return "Livrée";
            case 'cancelled': return "Annulée";
            default: return status;
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    return (
        <div className="min-h-screen bg-[#FAFAFA] selection:bg-[#111] selection:text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light tracking-tight text-[#111] mb-4">Suivre mon colis</h1>
                    <p className="text-[#111]/40 text-sm max-w-md mx-auto">
                        Entrez votre numéro de commande pour voir l'état d'avancement et l'historique de votre livraison.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-black/[0.04] shadow-soft p-6 md:p-8 mb-12">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111]/30" />
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="Ex: ORD-1708..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F9F9F9] border-transparent focus:bg-white focus:border-[#111]/10 outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="bg-[#111] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#222] transition-all disabled:opacity-50"
                        >
                            {loading ? "Recherche..." : "Suivre"}
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-2xl bg-rose-50 text-rose-500 text-xs font-medium flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Summary Card */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm">
                                    <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest mb-2">Statut Actuel</p>
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(order.status)}
                                        <span className="font-semibold text-[#111]">{getStatusLabel(order.status)}</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm">
                                    <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest mb-2">Total Commande</p>
                                    <p className="font-semibold text-[#111]">{formatPrice(order.total_amount)}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-black/[0.04] shadow-sm">
                                    <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest mb-2">Date Commande</p>
                                    <p className="font-semibold text-[#111]">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white p-8 rounded-3xl border border-black/[0.04] shadow-sm">
                                <h3 className="text-lg font-light mb-8">Historique de la commande</h3>
                                <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F0F0F0]">
                                    {logs.map((log, idx) => (
                                        <div key={log.id} className="relative pl-10">
                                            <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${idx === 0 ? "bg-[#111]" : "bg-[#DDD]"
                                                }`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-baseline justify-between gap-4 mb-1">
                                                    <h4 className={`text-sm font-bold ${idx === 0 ? "text-[#111]" : "text-[#111]/40"}`}>
                                                        {getStatusLabel(log.new_status)}
                                                    </h4>
                                                    <span className="text-[11px] text-[#111]/30 font-medium">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                {log.note && (
                                                    <p className="text-sm text-[#111]/50 italic">"{log.note}"</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <div className="relative pl-10">
                                            <div className="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full bg-[#111] flex items-center justify-center border-4 border-white shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            </div>
                                            <h4 className="text-sm font-bold text-[#111]">Commande Enregistrée</h4>
                                            <p className="text-sm text-[#111]/50">Votre commande a été reçue et est en cours de validation.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-white p-8 rounded-3xl border border-black/[0.04] shadow-sm">
                                <h3 className="text-lg font-light mb-6">Contenu du colis</h3>
                                <div className="divide-y divide-[#F5F5F5]">
                                    {order.order_items?.map((item: any) => (
                                        <div key={item.id} className="py-4 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-[#F9F9F9] overflow-hidden flex-shrink-0">
                                                <img src={item.products?.image_url} alt={item.products?.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest">{item.products?.brand}</p>
                                                <h4 className="text-sm font-medium text-[#111] truncate">{item.products?.name}</h4>
                                                <p className="text-xs text-[#111]/40">Quantité : {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[#111]">{formatPrice(item.unit_price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}
