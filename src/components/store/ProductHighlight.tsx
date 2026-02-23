import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storeApi } from "@/services/storeApi";
import { useCart } from "@/hooks/useCart";
import { useI18n } from "@/lib/i18n";

// Map color names to desaturated tints for background
const colorTints: Record<string, { bg: string; text: string }> = {
    noir: { bg: "linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%)", text: "#111" },
    black: { bg: "linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%)", text: "#111" },
    blanc: { bg: "linear-gradient(135deg, #F5F5F0 0%, #EEEEE8 100%)", text: "#111" },
    white: { bg: "linear-gradient(135deg, #F5F5F0 0%, #EEEEE8 100%)", text: "#111" },
    bleu: { bg: "linear-gradient(135deg, #E8EEF5 0%, #D0DEF0 100%)", text: "#1a3a5c" },
    blue: { bg: "linear-gradient(135deg, #E8EEF5 0%, #D0DEF0 100%)", text: "#1a3a5c" },
    rouge: { bg: "linear-gradient(135deg, #F5E8E8 0%, #F0D0D0 100%)", text: "#5c1a1a" },
    red: { bg: "linear-gradient(135deg, #F5E8E8 0%, #F0D0D0 100%)", text: "#5c1a1a" },
    vert: { bg: "linear-gradient(135deg, #E8F5EA 0%, #D0F0D5 100%)", text: "#1a4a20" },
    green: { bg: "linear-gradient(135deg, #E8F5EA 0%, #D0F0D5 100%)", text: "#1a4a20" },
    violet: { bg: "linear-gradient(135deg, #EDE8F5 0%, #DDD0F0 100%)", text: "#3a1a5c" },
    purple: { bg: "linear-gradient(135deg, #EDE8F5 0%, #DDD0F0 100%)", text: "#3a1a5c" },
    or: { bg: "linear-gradient(135deg, #F5F0E0 0%, #EEE5C8 100%)", text: "#5c4a1a" },
    gold: { bg: "linear-gradient(135deg, #F5F0E0 0%, #EEE5C8 100%)", text: "#5c4a1a" },
    rose: { bg: "linear-gradient(135deg, #F5E8EE 0%, #F0D0DD 100%)", text: "#5c1a3a" },
    pink: { bg: "linear-gradient(135deg, #F5E8EE 0%, #F0D0DD 100%)", text: "#5c1a3a" },
    gris: { bg: "linear-gradient(135deg, #EDEDED 0%, #DEDEDE 100%)", text: "#333" },
    gray: { bg: "linear-gradient(135deg, #EDEDED 0%, #DEDEDE 100%)", text: "#333" },
    grey: { bg: "linear-gradient(135deg, #EDEDED 0%, #DEDEDE 100%)", text: "#333" },
    titane: { bg: "linear-gradient(135deg, #E8E5E0 0%, #D5D0C8 100%)", text: "#3a3530" },
    titanium: { bg: "linear-gradient(135deg, #E8E5E0 0%, #D5D0C8 100%)", text: "#3a3530" },
};

const defaultTint = { bg: "linear-gradient(135deg, #F0F0F0 0%, #E5E5E5 100%)", text: "#111" };

function getTint(colorName: string) {
    const key = colorName.toLowerCase().trim();
    return colorTints[key] || defaultTint;
}

// Parse comma-separated or slash-separated color values
function parseColors(colorStr: string | null | undefined): string[] {
    if (!colorStr) return [];
    return colorStr.split(/[,\/]/).map(c => c.trim()).filter(Boolean);
}

export default function ProductHighlight() {
    const { t } = useI18n();
    const { addItem } = useCart();

    const { data: products = [] } = useQuery({
        queryKey: ['products', 'featured-highlight'],
        queryFn: () => storeApi.fetchProducts({ featured: true, limit: 1 }),
        staleTime: 30_000,
    });

    const product = products[0];
    const colors = useMemo(() => {
        if (!product) return [];
        return parseColors(product.color);
    }, [product]);

    const [selectedColor, setSelectedColor] = useState<string>("");

    // Set default color on product load
    const activeColor = selectedColor || (colors.length > 0 ? colors[0] : "");
    const tint = activeColor ? getTint(activeColor) : defaultTint;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("fr-DZ").format(price) + " DA";

    if (!product) return null;

    return (
        <section className="relative py-24 overflow-hidden">
            {/* Color-shift background */}
            <div
                className="absolute inset-0 color-shift-bg"
                style={{ background: tint.bg }}
            />

            {/* Sheen overlay */}
            <div className="absolute inset-0 sheen-effect overflow-hidden pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[500px]">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 0.9, 0.3, 1] }}
                        className="flex items-center justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 -m-10 rounded-full opacity-30" style={{ background: tint.bg }} />
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="relative z-10 w-full max-w-[350px] mx-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="relative z-10 w-72 h-72 rounded-3xl bg-white/50 flex items-center justify-center">
                                    <Star style={{ width: 48, height: 48 }} className="text-[#111]/10" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.9, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.06] bg-white/60 backdrop-blur-sm mb-6">
                            <Star style={{ width: 12, height: 12 }} className="text-[#111]/40" />
                            <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: tint.text }}>
                                {t('highlight.title')}
                            </span>
                        </div>

                        <h2
                            className="text-[clamp(2rem,4vw,3rem)] font-light tracking-tight mb-2 transition-colors"
                            style={{ color: tint.text, transitionDuration: "800ms" }}
                        >
                            {product.name}
                        </h2>

                        <p className="text-[11px] uppercase tracking-widest font-medium mb-4" style={{ color: tint.text, opacity: 0.4 }}>
                            {product.brand}
                        </p>

                        <p
                            className="text-3xl font-semibold mb-6 transition-colors"
                            style={{ color: tint.text, transitionDuration: "800ms" }}
                        >
                            {formatPrice(product.selling_price)}
                        </p>

                        {product.description && (
                            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: tint.text, opacity: 0.5 }}>
                                {product.description}
                            </p>
                        )}

                        {/* Color Swatches */}
                        {colors.length > 0 && (
                            <div className="mb-8">
                                <p className="text-xs font-medium mb-3" style={{ color: tint.text, opacity: 0.4 }}>
                                    {t('highlight.selectColor')}
                                </p>
                                <div className="flex gap-3">
                                    {colors.map((color) => {
                                        const colorTint = getTint(color);
                                        const isActive = color === activeColor;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${isActive
                                                        ? "border-black/20 bg-white shadow-sm"
                                                        : "border-black/[0.06] bg-white/40 hover:bg-white/70"
                                                    }`}
                                                style={{ color: colorTint.text }}
                                            >
                                                {color}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Specs if available */}
                        {(product.storage_capacity || product.warranty_months) && (
                            <div className="flex gap-6 mb-8 pb-6 border-b border-black/[0.06]">
                                {product.storage_capacity && (
                                    <div>
                                        <div className="text-lg font-semibold" style={{ color: tint.text }}>{product.storage_capacity}</div>
                                        <div className="text-[11px]" style={{ color: tint.text, opacity: 0.3 }}>Stockage</div>
                                    </div>
                                )}
                                {product.warranty_months && (
                                    <div>
                                        <div className="text-lg font-semibold" style={{ color: tint.text }}>{product.warranty_months} mois</div>
                                        <div className="text-[11px]" style={{ color: tint.text, opacity: 0.3 }}>Garantie</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add to Cart */}
                        <button
                            onClick={() => {
                                addItem({
                                    id: product.id,
                                    name: product.name,
                                    brand: product.brand,
                                    price: product.selling_price,
                                    image_url: product.image_url,
                                    color: activeColor || product.color,
                                    storage_capacity: product.storage_capacity,
                                });
                            }}
                            className="ps-btn-primary flex items-center gap-2"
                        >
                            <ShoppingCart style={{ width: 16, height: 16 }} />
                            {t('highlight.addToCart')}
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
