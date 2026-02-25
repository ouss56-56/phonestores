import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Plus, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storeApi, StoreProduct } from "@/services/storeApi";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate, Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { useI18n } from "@/lib/i18n";
import { cartBusiness } from "@/business/cartBusiness";
import { toast } from "@/hooks/use-toast";
import MagneticButton from "@/components/ui/MagneticButton";

interface FeaturedCollectionProps {
    onQuickView?: (product: StoreProduct) => void;
    categoryId?: string | null;
    onClearFilter?: () => void;
}

// Sample data for demonstration
const SAMPLE_PRODUCTS: StoreProduct[] = [
    {
        id: "sample-1",
        name: "iPhone 15 Pro",
        brand: "Apple",
        selling_price: 185000,
        purchase_price: 160000,
        quantity: 5,
        low_stock_threshold: 2,
        image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80",
        images: [],
        color: "Titanium",
        storage_capacity: "256GB",
        description: "The ultimate iPhone.",
        is_featured: true,
        is_active: true,
        category_id: null,
        type: "smartphone",
        warranty_months: 12,
        sku: "IP15P-256",
        added_at: new Date().toISOString(),
    },
    {
        id: "sample-2",
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        selling_price: 175000,
        purchase_price: 150000,
        quantity: 3,
        low_stock_threshold: 2,
        image_url: "https://images.unsplash.com/photo-1707230491501-14022ec1469e?w=800&q=80",
        images: [],
        color: "Titanium Gray",
        storage_capacity: "512GB",
        description: "Galaxy AI is here.",
        is_featured: true,
        is_active: true,
        category_id: null,
        type: "smartphone",
        warranty_months: 12,
        sku: "S24U-512",
        added_at: new Date().toISOString(),
    },
    {
        id: "sample-3",
        name: "AirPods Pro (2nd Gen)",
        brand: "Apple",
        selling_price: 45000,
        purchase_price: 35000,
        quantity: 10,
        low_stock_threshold: 3,
        image_url: "https://images.unsplash.com/photo-1588156979435-3757a120288d?w=800&q=80",
        images: [],
        color: "White",
        storage_capacity: null,
        description: "Magical experience.",
        is_featured: true,
        is_active: true,
        category_id: null,
        type: "accessory",
        warranty_months: 6,
        sku: "APP2",
        added_at: new Date().toISOString(),
    },
    {
        id: "sample-4",
        name: "Sony WH-1000XM5",
        brand: "Sony",
        selling_price: 65000,
        purchase_price: 55000,
        quantity: 2,
        low_stock_threshold: 1,
        image_url: "https://images.unsplash.com/photo-1628202926206-c63a34b1618f?w=800&q=80",
        images: [],
        color: "Black",
        storage_capacity: null,
        description: "Best noise cancelling.",
        is_featured: true,
        is_active: true,
        category_id: null,
        type: "accessory",
        warranty_months: 12,
        sku: "XM5-BLK",
        added_at: new Date().toISOString(),
    }
];

export default function FeaturedCollection({ onQuickView, categoryId, onClearFilter }: FeaturedCollectionProps) {
    const { t } = useI18n();
    const { addItem } = useCartStore(); // Changed from useCart
    const { toggle, has } = useWishlist();
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
    const [onlyInStock, setOnlyInStock] = useState(false);

    const { data: dbProducts = [], isLoading } = useQuery({
        queryKey: ['products', 'featured', categoryId],
        queryFn: () => storeApi.fetchProducts({
            limit: 12,
            category: categoryId || undefined,
            featured: categoryId ? undefined : true // Show all featured by default, or specific cat if filtered
        }),
        staleTime: 30_000,
    });

    const products = useMemo(() => {
        let list = dbProducts.length > 0 ? dbProducts : SAMPLE_PRODUCTS;

        // Apply filters
        return list.filter(p => {
            const matchesPrice = p.selling_price >= priceRange[0] && p.selling_price <= priceRange[1];
            const matchesStock = onlyInStock ? p.quantity > 0 : true;
            return matchesPrice && matchesStock;
        });
    }, [dbProducts, priceRange, onlyInStock]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    const handleAddToCart = async (product: StoreProduct) => { // Made async
        const validation = await cartBusiness.validateProductForCart(product.id); // Added stock validation
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

        toast({ // Added success toast
            title: "Ajouté !",
            description: `${product.name} est dans votre panier.`,
        });
    };

    return (
        <section id="featured" className="relative py-24" style={{ background: "#F2F2F2" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 0.9, 0.3, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight text-[#111] mb-3 animate-spiral-in">
                        {categoryId ? t('nav.products') : t('featured.title')}
                    </h2>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#111]/30">Prix max:</span>
                            <input
                                type="range"
                                min="0"
                                max="500000"
                                step="10000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                className="w-32 accent-[#111]"
                            />
                            <span className="text-[11px] font-medium min-w-[80px]">{formatPrice(priceRange[1])}</span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={onlyInStock}
                                onChange={(e) => setOnlyInStock(e.target.checked)}
                                className="w-4 h-4 accent-[#111]"
                            />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#111]/30 group-hover:text-[#111] transition-colors">
                                En Stock Uniquement
                            </span>
                        </label>

                        {categoryId && (
                            <button
                                onClick={onClearFilter}
                                className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                            >
                                Effacer la catégorie
                            </button>
                        )}
                    </div>

                    <p className="text-[#111]/35 text-[11px] font-bold uppercase tracking-widest mb-6">
                        {products.length} {products.length > 1 ? 'produits' : 'produit'}
                    </p>
                </motion.div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="rounded-2xl bg-white h-80 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Product Grid */}
                {!isLoading && products.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {products.map((product, index) => {
                            const isLowStock = product.quantity > 0 && product.quantity <= product.low_stock_threshold;
                            const isOutOfStock = product.quantity === 0;
                            const isPopular = product.is_featured && product.quantity > 0 && product.quantity <= 5;

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-30px" }}
                                    transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.22, 0.9, 0.3, 1] }}
                                >
                                    <div className="relative aspect-square overflow-hidden bg-[#F8F8F8] ambient-sheen">
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
                                                <span className="ps-badge-popular">
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
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-300" />
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <MagneticButton distance={0.2}>
                                                <button
                                                    onClick={() => toggle(product.id)}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${has(product.id)
                                                        ? "bg-[#111] text-white"
                                                        : "bg-white/90 backdrop-blur-sm text-[#111]/60 hover:text-[#111]"
                                                        }`}
                                                    aria-label="Toggle wishlist"
                                                >
                                                    <Heart style={{ width: 15, height: 15 }} fill={has(product.id) ? "currentColor" : "none"} />
                                                </button>
                                            </MagneticButton>
                                            <MagneticButton distance={0.2}>
                                                <button
                                                    onClick={() => onQuickView?.(product)}
                                                    className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#111]/60 hover:text-[#111] transition-colors"
                                                    aria-label={t('featured.quickView')}
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
                                                        onClick={() => handleAddToCart(product)}
                                                        className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-[#333] shadow-lg"
                                                        aria-label={t('featured.addToCart')}
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
                                            <div className="price-reveal-container">
                                                <span className="text-base font-semibold text-[#111] price-reveal-text">
                                                    {formatPrice(product.selling_price)}
                                                </span>
                                                <div className="price-reveal-line" />
                                            </div>
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
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
