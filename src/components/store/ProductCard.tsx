import { motion } from "framer-motion";
import { Heart, Eye, Plus, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { StoreProduct } from "@/services/storeApi";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useI18n } from "@/lib/i18n";
import { cartBusiness } from "@/business/cartBusiness";
import { toast } from "@/hooks/use-toast";
import MagneticButton from "@/components/ui/MagneticButton";

interface ProductCardProps {
    product: StoreProduct;
    index?: number;
    onQuickView?: (product: StoreProduct) => void;
}

export default function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
    const { t } = useI18n();
    const { addItem } = useCartStore();
    const { toggle, has } = useWishlist();

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
    };

    const isLowStock = product.quantity > 0 && product.quantity <= product.low_stock_threshold;
    const isOutOfStock = product.quantity === 0;
    const isPopular = product.is_featured && product.quantity > 0 && product.quantity <= 5;

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.22, 0.9, 0.3, 1] }}
            className="group"
        >
            <div className="relative aspect-square overflow-hidden bg-[#F8F8F8] rounded-2xl ambient-sheen">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#111]/10">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                        </div>
                    )}
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {isPopular && (
                        <span className="bg-[#111] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                            {t('featured.popular')}
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#111]/50 text-[11px] font-medium rounded-full">
                            {t('featured.outOfStock')}
                        </span>
                    )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <MagneticButton distance={0.2}>
                        <button
                            onClick={(e) => { e.preventDefault(); toggle(product.id); }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${has(product.id)
                                ? "bg-[#111] text-white"
                                : "bg-white/90 backdrop-blur-sm text-[#111]/60 hover:text-[#111]"
                                }`}
                        >
                            <Heart style={{ width: 15, height: 15 }} fill={has(product.id) ? "currentColor" : "none"} />
                        </button>
                    </MagneticButton>
                    <MagneticButton distance={0.2}>
                        <button
                            onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
                            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#111]/60 hover:text-[#111] transition-colors"
                        >
                            <Eye style={{ width: 15, height: 15 }} />
                        </button>
                    </MagneticButton>
                </div>

                {/* Floating Add Button */}
                {!isOutOfStock && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <MagneticButton distance={0.3}>
                            <button
                                onClick={handleAddToCart}
                                className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-[#333] shadow-lg"
                            >
                                <Plus style={{ width: 18, height: 18 }} />
                            </button>
                        </MagneticButton>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-[11px] text-[#111]/30 font-medium uppercase tracking-wider mb-1">
                    {product.brand}
                </p>
                <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm text-[#111] mb-2 line-clamp-1 hover:text-[#111]/60 transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[#111]">
                        {formatPrice(product.selling_price)}
                    </span>
                    {product.color && (
                        <span className="text-[11px] text-[#111]/25">{product.color}</span>
                    )}
                </div>

                {/* Low Stock Indicator */}
                {isLowStock && (
                    <div className="flex items-center gap-1 mt-2">
                        <AlertTriangle style={{ width: 11, height: 11 }} className="text-orange-500" />
                        <span className="text-[11px] text-orange-600 font-medium">
                            {t('featured.lowStock', { count: product.quantity })}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
