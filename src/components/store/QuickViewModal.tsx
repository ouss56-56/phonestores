import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingCart, Package } from "lucide-react";
import { StoreProduct } from "@/services/storeApi";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useI18n } from "@/lib/i18n";
import { cartBusiness } from "@/business/cartBusiness";
import { toast } from "@/hooks/use-toast";

interface QuickViewModalProps {
    product: StoreProduct | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const { t } = useI18n();
    const { addItem } = useCartStore();
    const { toggle, has } = useWishlist();

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    if (!product) return null;

    const handleAddToCart = async () => {
        const validation = await cartBusiness.validateProductForCart(product.id);
        if (!validation.valid) {
            toast({
                title: "Oups !",
                description: validation.error || "Produit indisponible",
                variant: "destructive",
            });
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.selling_price,
            image_url: product.image_url,
            color: product.color,
            storage_capacity: product.storage_capacity,
        });

        toast({
            title: "Ajouté !",
            description: `${product.name} est dans votre panier.`,
        });

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.22, 0.9, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label={product.name}
                        >
                            <div className="grid md:grid-cols-2 gap-0">
                                {/* Image */}
                                <div className="relative aspect-square bg-[#F5F5F5] rounded-tl-3xl rounded-bl-none md:rounded-bl-3xl rounded-tr-3xl md:rounded-tr-none overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#111]/10">
                                            <Package style={{ width: 64, height: 64 }} />
                                        </div>
                                    )}

                                    {/* Close */}
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#111]/50 hover:text-[#111] transition-colors"
                                        aria-label={t('quickView.close')}
                                    >
                                        <X style={{ width: 16, height: 16 }} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col justify-center">
                                    <p className="text-[11px] text-[#111]/30 font-medium uppercase tracking-widest mb-2">
                                        {product.brand}
                                    </p>
                                    <h2 className="text-xl font-medium text-[#111] mb-4">
                                        {product.name}
                                    </h2>

                                    <p className="text-2xl font-semibold text-[#111] mb-4">
                                        {formatPrice(product.selling_price)}
                                    </p>

                                    {product.description && (
                                        <p className="text-sm text-[#111]/40 leading-relaxed mb-6 line-clamp-4">
                                            {product.description}
                                        </p>
                                    )}

                                    {/* Specs */}
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {product.color && (
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-[#F2F2F2] text-[#111]/50">
                                                {product.color}
                                            </span>
                                        )}
                                        {product.storage_capacity && (
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-[#F2F2F2] text-[#111]/50">
                                                {product.storage_capacity}
                                            </span>
                                        )}
                                        {product.warranty_months && (
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-[#F2F2F2] text-[#111]/50">
                                                Garantie {product.warranty_months} mois
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.quantity === 0}
                                            className="ps-btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
                                        >
                                            <ShoppingCart style={{ width: 16, height: 16 }} />
                                            {t('quickView.addToCart')}
                                        </button>
                                        <button
                                            onClick={() => toggle(product.id)}
                                            className={`ps-btn-icon w-12 h-12 ${has(product.id) ? "bg-[#111] text-white border-[#111]" : ""}`}
                                            aria-label="Toggle wishlist"
                                        >
                                            <Heart style={{ width: 16, height: 16 }} fill={has(product.id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>

                                    {/* Stock info */}
                                    {product.quantity > 0 && product.quantity <= product.low_stock_threshold && (
                                        <p className="text-[11px] text-orange-600 font-medium mt-3">
                                            {t('featured.lowStock', { count: product.quantity })}
                                        </p>
                                    )}
                                    {product.quantity === 0 && (
                                        <p className="text-[11px] text-[#111]/30 font-medium mt-3">
                                            {t('featured.outOfStock')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
