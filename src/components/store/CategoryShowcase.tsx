import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Headphones, Battery, Cable } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storeApi, StoreCategory } from "@/services/storeApi";
import { useI18n } from "@/lib/i18n";

const categoryIcons: Record<string, typeof Smartphone> = {
    phone: Smartphone,
    smartphone: Smartphone,
    earphone: Headphones,
    headphone: Headphones,
    accessory: Cable,
    accessories: Cable,
    battery: Battery,
    batteries: Battery,
};

const categoryImages: Record<string, string> = {
    phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    smartphone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    earphone: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    headphone: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    accessory: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop",
    accessories: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop",
    battery: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
    batteries: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
};

function getIcon(category: StoreCategory) {
    const key = category.slug?.toLowerCase() || category.type?.toLowerCase() || '';
    return categoryIcons[key] || Smartphone;
}

function getImage(category: StoreCategory) {
    const key = category.slug?.toLowerCase() || category.type?.toLowerCase() || '';
    return categoryImages[key] || categoryImages.phone;
}

export default function CategoryShowcase() {
    const { t } = useI18n();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => storeApi.fetchCategories(),
        staleTime: 30_000,
        refetchInterval: 60_000, // Poll every 60s for admin changes
    });

    return (
        <section id="categories" className="relative py-24" style={{ background: "#FAFAFA" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 0.9, 0.3, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight text-[#111] mb-3">
                        {t('categories.title')}
                    </h2>
                    <p className="text-[#111]/35 text-base font-light">
                        {t('categories.subtitle')}
                    </p>
                </motion.div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="rounded-2xl bg-[#F2F2F2] h-72 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Category Cards */}
                {!isLoading && categories.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map((category, index) => {
                            const Icon = getIcon(category);
                            const image = getImage(category);
                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 0.9, 0.3, 1] }}
                                    className="group relative overflow-hidden rounded-2xl bg-white border border-black/[0.04] cursor-pointer"
                                    style={{ minHeight: 280 }}
                                >
                                    {/* Image */}
                                    <div className="relative h-44 overflow-hidden">
                                        <img
                                            src={image}
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:translate-y-[-7px] group-hover:scale-[1.02]"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                                            <Icon style={{ width: 18, height: 18 }} className="text-[#111]" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-medium text-base text-[#111] mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-[#111]/35 mb-4">
                                            {category.product_count} {t('categories.products')}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-[#111]/50 group-hover:text-[#111] transition-colors duration-300">
                                            <span>{t('categories.browse')}</span>
                                            <ArrowRight style={{ width: 14, height: 14 }} className="transition-transform duration-300 group-hover:translate-x-1" />
                                            <span className="absolute bottom-5 left-5 w-0 h-[1px] bg-[#111] group-hover:w-[calc(100%-40px)] transition-all duration-500 ease-out" />
                                        </div>
                                    </div>

                                    {/* Hover shadow */}
                                    <div className="absolute inset-0 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow duration-500 pointer-events-none" />
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && categories.length === 0 && (
                    <div className="text-center py-16 text-[#111]/25 text-sm">
                        Aucune catégorie disponible
                    </div>
                )}
            </div>
        </section>
    );
}
