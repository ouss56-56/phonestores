import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    ShieldCheck,
    Truck,
    RotateCcw,
    Minus,
    Plus,
    Package,
    ChevronRight,
    Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storeApi, StoreProduct } from "@/services/storeApi";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useI18n } from "@/lib/i18n";
import { cartBusiness } from "@/business/cartBusiness";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import { recommendationBusiness } from "@/business/recommendationBusiness";
import QuickViewModal from "@/components/store/QuickViewModal";

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useI18n();
    const { addItem } = useCartStore();
    const { toggle, has } = useWishlist();

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => storeApi.fetchProductById(id!),
        enabled: !!id,
    });

    const { data: similarProducts = [] } = useQuery({
        queryKey: ['similar-products', id],
        queryFn: () => recommendationBusiness.getSimilarProducts(id!),
        enabled: !!id,
    });

    const { data: boughtTogether = [] } = useQuery({
        queryKey: ['bought-together', id],
        queryFn: () => recommendationBusiness.getBoughtTogether(id!),
        enabled: !!id,
    });

    const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);

    // All images for the gallery
    const gallery = useMemo(() => {
        if (!product) return [];
        const imgs = [product.image_url];
        if (product.images && Array.isArray(product.images)) {
            imgs.push(...product.images);
        }
        return imgs.filter(Boolean) as string[];
    }, [product]);

    // Set first image as active when gallery loads
    useMemo(() => {
        if (gallery.length > 0 && !activeImage) {
            setActiveImage(gallery[0]);
        }
    }, [gallery, activeImage]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    const handleAddToCart = async () => {
        if (!product) return;

        const validation = await cartBusiness.validateProductForCart(product.id);
        if (!validation.valid) {
            toast({
                title: "Oups !",
                description: validation.error || "Produit indisponible",
                variant: "destructive",
            });
            return;
        }

        for (let i = 0; i < quantity; i++) {
            addItem({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.selling_price,
                image_url: product.image_url,
                color: product.color,
                storage_capacity: product.storage_capacity,
            });
        }

        toast({
            title: "Ajouté !",
            description: `${quantity} x ${product.name} ajouté au panier.`,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#111]/10 border-t-[#111] rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                    <h2 className="text-2xl font-light mb-4">Produit non trouvé</h2>
                    <Link to="/" className="text-admin-btn font-medium uppercase tracking-widest text-[11px]">Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.quantity === 0;

    return (
        <div className="min-h-screen bg-white selection:bg-[#111] selection:text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] text-[#111]/40 uppercase tracking-widest mb-12">
                    <Link to="/" className="hover:text-[#111] transition-colors">{t('nav.home')}</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#111]">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">
                    {/* Media Gallery */}
                    <div className="space-y-6">
                        <motion.div
                            layoutId={`product-image-${product.id}`}
                            className="aspect-[4/5] bg-[#F9F9F9] rounded-3xl overflow-hidden relative group"
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    src={activeImage || ''}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-8 md:p-12"
                                />
                            </AnimatePresence>

                            {/* Badges */}
                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                {product.is_featured && (
                                    <span className="bg-[#111] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                                        Premium
                                    </span>
                                )}
                                {isOutOfStock && (
                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                                        Rupture de stock
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Thumbnails */}
                        {gallery.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-24 aspect-square rounded-2xl overflow-hidden bg-[#F9F9F9] border-2 transition-all ${activeImage === img ? "border-[#111]" : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <p className="text-[12px] text-[#111]/30 font-bold uppercase tracking-[0.2em] mb-3">
                                {product.brand}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-light text-[#111] mb-6 tracking-tight leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-3xl font-semibold text-[#111]">
                                    {formatPrice(product.selling_price)}
                                </span>
                                {product.quantity > 0 && (
                                    <span className="text-[11px] text-[#111]/40 uppercase tracking-widest font-bold">
                                        En Stock ({product.quantity})
                                    </span>
                                )}
                            </div>

                            <div className="h-px bg-[#F0F0F0] w-full mb-8" />
                        </div>

                        {/* Details */}
                        <div className="space-y-8 mb-12">
                            {product.description && (
                                <div className="prose prose-sm text-[#111]/60 leading-relaxed max-w-none">
                                    <p>{product.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-y-4 gap-x-12">
                                {product.color && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest">Couleur</p>
                                        <p className="text-sm font-medium">{product.color}</p>
                                    </div>
                                )}
                                {product.storage_capacity && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest">Capacité</p>
                                        <p className="text-sm font-medium">{product.storage_capacity}</p>
                                    </div>
                                )}
                                {product.warranty_months && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest">Garantie</p>
                                        <p className="text-sm font-medium">{product.warranty_months} Mois</p>
                                    </div>
                                )}
                                {product.sku && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#111]/30 uppercase font-bold tracking-widest">SKU</p>
                                        <p className="text-sm font-medium font-mono-tech">{product.sku}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto space-y-6">
                            {!isOutOfStock ? (
                                <>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center border border-[#EEE] rounded-full p-1.5 bg-[#FAFAFA]">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="w-10 h-10 flex items-center justify-center text-[#111]/40 hover:text-[#111] transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                                                className="w-10 h-10 flex items-center justify-center text-[#111]/40 hover:text-[#111] transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-[11px] text-[#111]/30 font-medium">
                                            {quantity > 1 ? `Total: ${formatPrice(product.selling_price * quantity)}` : ''}
                                        </span>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-[#111] text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-[#222] transition-all transform active:scale-[0.98] shadow-soft"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Ajouter au panier
                                        </button>
                                        <button
                                            onClick={() => toggle(product.id)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${has(product.id) ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-white border-[#EEE] text-[#111]/40 hover:border-[#111] hover:text-[#111]"
                                                }`}
                                        >
                                            <Heart className="w-5 h-5" fill={has(product.id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button disabled className="w-full bg-[#FAFAFA] text-[#111]/20 h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] border border-[#EEE]">
                                    Actuellement indisponible
                                </button>
                            )}
                        </div>

                        {/* USP */}
                        <div className="grid grid-cols-3 gap-4 mt-12 py-8 border-t border-[#F5F5F5]">
                            <div className="flex flex-col items-center text-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#111]/40" />
                                <span className="text-[10px] text-[#111]/50 font-medium uppercase tracking-tight">Paiement Sécurisé</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <Truck className="w-5 h-5 text-[#111]/40" />
                                <span className="text-[10px] text-[#111]/50 font-medium uppercase tracking-tight">Livraison Rapide</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <RotateCcw className="w-5 h-5 text-[#111]/40" />
                                <span className="text-[10px] text-[#111]/50 font-medium uppercase tracking-tight">Retour facile</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Recommendations Section */}
            <div className="bg-[#F9F9F9] py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {boughtTogether.length > 0 && (
                        <div className="mb-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-12"
                            >
                                <h2 className="text-3xl font-light tracking-tight text-[#111] mb-2">Souvent achetés ensemble</h2>
                                <p className="text-[#111]/40 text-[11px] font-bold uppercase tracking-widest">Complétez votre achat avec ces articles populaires</p>
                            </motion.div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {boughtTogether.map((p, i) => (
                                    <ProductCard key={p.id} product={p as any} index={i} onQuickView={setQuickViewProduct} />
                                ))}
                            </div>
                        </div>
                    )}

                    {similarProducts.length > 0 && (
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-12"
                            >
                                <h2 className="text-3xl font-light tracking-tight text-[#111] mb-2">Vous pourriez aussi aimer</h2>
                                <p className="text-[#111]/40 text-[11px] font-bold uppercase tracking-widest">Sélectionnés spécialement pour vous par Lumina AI</p>
                            </motion.div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {similarProducts.map((p, i) => (
                                    <ProductCard key={p.id} product={p as any} index={i} onQuickView={setQuickViewProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />

            <Footer />
        </div>
    );
}
