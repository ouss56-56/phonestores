import { motion } from "framer-motion";
import { Heart, Eye, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartStore } from "@/stores/cartStore";
import { useI18n } from "@/lib/i18n";
import { storeApi, StoreProduct } from "@/services/storeApi";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

export default function WishlistPage() {
    const { t } = useI18n();
    const { items: wishlistIds, toggle, clear } = useWishlist();
    const { addItem } = useCartStore();

    // Fetch all products and filter by wishlist IDs
    const { data: allProducts = [] } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: () => storeApi.fetchProducts({ limit: 500 }),
        staleTime: 30_000,
    });

    const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    const handleAddToCart = (product: StoreProduct) => {
        addItem({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.selling_price,
            image_url: product.image_url,
            color: product.color,
            storage_capacity: product.storage_capacity,
        });
    };

    return (
        <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#111]/30 hover:text-[#111] transition-colors mb-3">
                            <ArrowLeft style={{ width: 14, height: 14 }} />
                            Retour
                        </Link>
                        <h1 className="text-3xl font-light tracking-tight text-[#111]">
                            {t('wishlist.title')}
                        </h1>
                    </div>
                    {wishlistIds.length > 0 && (
                        <button onClick={clear} className="ps-btn-secondary text-sm flex items-center gap-1.5">
                            <Trash2 style={{ width: 14, height: 14 }} />
                            Tout supprimer
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {wishlistIds.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <Heart style={{ width: 56, height: 56 }} className="text-[#111]/8 mb-4" />
                        <h2 className="font-medium text-lg text-[#111] mb-2">{t('wishlist.empty')}</h2>
                        <p className="text-sm text-[#111]/30 mb-6">{t('wishlist.emptyDesc')}</p>
                        <Link to="/" className="ps-btn-primary">
                            {t('wishlist.browse')}
                        </Link>
                    </motion.div>
                )}

                {/* Wishlist Grid */}
                {wishlistProducts.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {wishlistProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white rounded-2xl border border-black/[0.03] overflow-hidden product-card"
                            >
                                <div className="relative aspect-square bg-[#F8F8F8] overflow-hidden">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#111]/10">
                                            <Heart style={{ width: 32, height: 32 }} />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => toggle(product.id)}
                                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#111] text-white flex items-center justify-center"
                                    >
                                        <Heart style={{ width: 15, height: 15 }} fill="currentColor" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <p className="text-[11px] text-[#111]/30 font-medium uppercase tracking-wider mb-1">{product.brand}</p>
                                    <h3 className="font-medium text-sm text-[#111] mb-2 line-clamp-1">{product.name}</h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-base font-semibold text-[#111]">{formatPrice(product.selling_price)}</span>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.quantity === 0}
                                        className="ps-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        <ShoppingCart style={{ width: 14, height: 14 }} />
                                        {t('featured.addToCart')}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
