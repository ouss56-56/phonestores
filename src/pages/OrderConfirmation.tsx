import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Home, Clock } from 'lucide-react';
import { orderBusiness } from '@/business/orderBusiness';

interface OrderData {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    total_amount: number;
    status: string;
    created_at: string;
    order_items: Array<{
        id: string;
        quantity: number;
        unit_price: number;
        products: {
            name: string;
            image_url: string | null;
            brand: string;
        } | null;
    }>;
}

export default function OrderConfirmation() {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('fr-DZ').format(price) + ' DA';

    useEffect(() => {
        if (!orderNumber) {
            setError('Numéro de commande manquant');
            setLoading(false);
            return;
        }

        orderBusiness
            .getOrderByNumber(orderNumber)
            .then((data) => {
                setOrder(data as OrderData);
            })
            .catch(() => {
                setError('Commande introuvable');
            })
            .finally(() => setLoading(false));
    }, [orderNumber]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center glass-card rounded-3xl p-12 max-w-md">
                    <h2 className="font-heading font-bold text-2xl mb-4">
                        {error || 'Commande introuvable'}
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-cyber px-6 py-3 rounded-xl text-sm font-heading font-semibold"
                    >
                        Retour à la Boutique
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-24 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="font-heading font-bold text-3xl mb-2">
                        Commande Confirmée !
                    </h1>
                    <p className="text-muted-foreground">
                        Merci pour votre commande, {order.customer_name}
                    </p>
                </motion.div>

                {/* Order Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-6 mb-6 space-y-4"
                >
                    <div className="flex items-center justify-between border-b border-border/30 pb-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                Numéro de commande
                            </p>
                            <p className="font-heading font-bold text-lg">
                                {order.order_number}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            En attente
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        {order.order_items?.map((item) => (
                            <div key={item.id} className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                    {item.products?.image_url && (
                                        <img
                                            src={item.products.image_url}
                                            alt={item.products?.name || ''}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {item.products?.name || 'Produit'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.products?.brand} · x{item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-semibold whitespace-nowrap">
                                    {formatPrice(Number(item.unit_price) * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-border/30 pt-4 flex justify-between items-center">
                        <span className="font-heading font-semibold text-lg">Total</span>
                        <span className="font-heading font-bold text-xl gradient-text">
                            {formatPrice(Number(order.total_amount))}
                        </span>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-heading font-semibold text-sm mb-1">
                                Prochaines étapes
                            </h3>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3" /> Notre équipe va vérifier votre commande
                                </li>
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3" /> Vous serez contacté par téléphone pour confirmation
                                </li>
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3" /> Livraison et paiement à la réception
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 btn-cyber px-8 py-3 rounded-xl text-sm font-heading font-semibold"
                    >
                        <Home className="w-4 h-4" />
                        Continuer les Achats
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
