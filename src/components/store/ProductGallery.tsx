import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, ChevronLeft, ChevronRight, Zap, Battery, Wifi, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { TiltCard, MagneticButton } from "@/components/ui/animations";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const accentColors: Record<string, { hue: string; color: string; secondary: string }> = {
  Apple: { hue: "210", color: "hsl(210, 8%, 45%)", secondary: "hsl(210, 8%, 20%)" }, // Titanium/Natural
  Samsung: { hue: "280", color: "hsl(280, 70%, 65%)", secondary: "hsl(280, 70%, 30%)" }, // Violet/Dark
  Xiaomi: { hue: "15", color: "hsl(15, 85%, 55%)", secondary: "hsl(15, 85%, 25%)" }, // Orange/Rust
  Anker: { hue: "190", color: "hsl(190, 90%, 50%)", secondary: "hsl(190, 90%, 20%)" }, // Cyan/Deep
  Google: { hue: "140", color: "hsl(140, 60%, 50%)", secondary: "hsl(140, 60%, 20%)" }, // Mint/Forest
  Sony: { hue: "340", color: "hsl(340, 70%, 60%)", secondary: "hsl(340, 70%, 25%)" }, // Crimson/Wine
  default: { hue: "15", color: "hsl(15, 85%, 55%)", secondary: "hsl(15, 85%, 25%)" },
};

function getAccent(brand: string) {
  return accentColors[brand as keyof typeof accentColors] || accentColors.default;
}

export default function ProductGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    // Adding more sample products if supabase returns empty or for demonstration
    const demoProducts: Product[] = [
      {
        id: "1",
        name: "iPhone 16 Pro Max",
        brand: "Apple",
        selling_price: 189990,
        purchase_price: 150000,
        image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=600&auto=format&fit=crop",
        description: "The ultimate iPhone with titanium design and A18 Pro chip.",
        quantity: 12,
        is_featured: true,
        is_active: true,
        low_stock_threshold: 5,
        color: "Natural Titanium",
        storage_capacity: "256GB"
      } as any,
      {
        id: "2",
        name: "Galaxy S24 Ultra",
        brand: "Samsung",
        selling_price: 169990,
        purchase_price: 130000,
        image_url: "https://images.unsplash.com/photo-1707064434252-87e35ccb77c5?q=80&w=600&auto=format&fit=crop",
        description: "Experience the next level of mobile productivity with AI.",
        quantity: 8,
        is_featured: true,
        is_active: true,
        low_stock_threshold: 5,
        color: "Titanium Violet",
        storage_capacity: "512GB"
      } as any,
      {
        id: "3",
        name: "Xiaomi 14 Ultra",
        brand: "Xiaomi",
        selling_price: 139990,
        purchase_price: 110000,
        image_url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=600&auto=format&fit=crop",
        description: "Masterpiece photography with Leica optics.",
        quantity: 4,
        is_featured: true,
        is_active: true,
        low_stock_threshold: 5,
        color: "Black",
        storage_capacity: "512GB"
      } as any,
      {
        id: "4",
        name: "Pixel 9 Pro",
        brand: "Google",
        selling_price: 129990,
        purchase_price: 100000,
        image_url: "https://images.unsplash.com/photo-1610945265064-0e31885f190a?q=80&w=600&auto=format&fit=crop",
        description: "The most powerful Pixel yet with advanced Gemini AI.",
        quantity: 15,
        is_featured: true,
        is_active: true,
        low_stock_threshold: 5,
        color: "Hazel",
        storage_capacity: "128GB"
      } as any,
      {
        id: "5",
        name: "Xperia 1 VI",
        brand: "Sony",
        selling_price: 149990,
        purchase_price: 120000,
        image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
        description: "Professional camera tech in a smartphone.",
        quantity: 3,
        is_featured: true,
        is_active: true,
        low_stock_threshold: 5,
        color: "Platinum Silver",
        storage_capacity: "256GB"
      } as any
    ];

    supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("selling_price", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(demoProducts);
        }
        setLoading(false);
      });
  }, []);

  if (loading || products.length === 0) {
    return (
      <section id="gallery" className="py-24">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const product = products[activeIdx];
  const accent = getAccent(product.brand);
  const margin = product.selling_price > 0 && product.purchase_price > 0
    ? Math.round(((product.selling_price - product.purchase_price) / product.selling_price) * 100) : 0;

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-DZ").format(price) + " DA";

  return (
    <section id="gallery" className="relative py-24 overflow-hidden transition-colors duration-1000">
      <motion.div
        key={activeIdx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 75% 50%, hsla(${accent.hue},60%,35%,0.1) 0%, transparent 80%)`
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ background: accent.color }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
          style={{ background: accent.secondary }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/10 mb-5">
            <span className="text-xs font-heading text-primary tracking-widest uppercase font-medium">Collection Vedette</span>
          </div>
          <h2 className="font-display font-bold text-display mb-4">
            <span className="text-foreground">Nos </span>
            <span className="gradient-text italic">Téléphones Phares</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sélection rigoureuse des meilleurs appareils pour les connaisseurs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <TiltCard className="flex justify-center items-center relative min-h-[400px]">
            <div
              className="absolute w-80 h-80 rounded-full blur-[100px] opacity-30 transition-all duration-1000"
              style={{ background: accent.color }}
            />
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-64 sm:w-80 h-auto object-contain relative z-10 rounded-3xl"
                style={{ filter: `drop-shadow(0 40px 80px ${accent.color}66)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-3xl pointer-events-none holographic opacity-40" />
            </motion.div>
          </TiltCard>

          <div className="flex flex-col gap-6">
            <motion.div
              key={`info-${activeIdx}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider"
                  style={{ background: `${accent.color}20`, color: accent.color, border: `1px solid ${accent.color}30` }}
                >
                  {product.brand}
                </span>
                {product.quantity <= (product.low_stock_threshold || 5) && (
                  <span className="popularity-pulse px-4 py-1.5 rounded-full text-xs font-heading font-bold bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">
                    Stock Limité
                  </span>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5" fill={i <= 4 ? accent.color : "none"} stroke={accent.color} />
                  ))}
                  <span className="text-xs font-mono-tech ml-1" style={{ color: accent.color }}>4.9</span>
                </div>
              </div>

              <h3 className="font-display font-bold text-4xl lg:text-6xl mb-2 italic transition-colors duration-500" style={{ color: accent.color }}>
                {product.name}
              </h3>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group inline-block mb-4"
              >
                <div className="text-4xl lg:text-5xl font-display font-bold text-white mb-1">{formatPrice(product.selling_price)}</div>
                <div className="h-1 w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" style={{ background: accent.color }} />
              </motion.div>

              {product.description && (
                <p className="text-base text-muted-foreground/90 mt-4 leading-relaxed max-w-xl">{product.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-8">
                <div className="glass-card rounded-2xl p-4 flex-1 min-w-[140px] border-primary/5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Capacité</div>
                  <div className="text-lg font-heading font-bold text-white">{product.storage_capacity || "256GB"}</div>
                </div>
                <div className="glass-card rounded-2xl p-4 flex-1 min-w-[140px] border-primary/5">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Couleur</div>
                  <div className="text-lg font-heading font-bold text-white">{product.color || "Standard"}</div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 mt-6 border-primary/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">État du Stock</span>
                  <span
                    className="text-xs font-mono-tech font-bold flex items-center gap-1.5"
                    style={{ color: product.quantity < 10 ? "hsl(var(--destructive))" : "hsl(var(--success))" }}
                  >
                    <span className="w-2 h-2 rounded-full animate-pulse inline-block"
                      style={{ background: product.quantity < 10 ? "hsl(var(--destructive))" : "hsl(var(--success))" }} />
                    {product.quantity} unités en stock
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${accent.secondary}, ${accent.color})` }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => addItem({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.selling_price,
                    image_url: product.image_url,
                    color: product.color,
                    storage_capacity: product.storage_capacity,
                  })}
                  className="flex-[2] py-4 rounded-2xl text-base font-heading font-bold text-background flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.03] active:scale-95 group overflow-hidden relative"
                  style={{ background: `linear-gradient(135deg, ${accent.color}, ${accent.secondary})`, boxShadow: `0 20px 40px ${accent.color}33` }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                  <ShoppingCart className="w-5 h-5" /> Ajouter au Panier
                </button>
                <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-heading font-bold hover:bg-white/10 transition-colors">
                  Détails
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product thumbnails */}
        <div className="flex justify-center flex-wrap gap-4 mt-20">
          {products.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setActiveIdx(i)}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl glass-card transition-all duration-500 min-w-[120px] ${activeIdx === i ? "border-primary/40 bg-white/10 shadow-2xl" : "opacity-40 hover:opacity-80 border-white/5"
                }`}
              style={activeIdx === i ? { borderColor: getAccent(p.brand).color + "66", boxShadow: `0 20px 40px ${getAccent(p.brand).color}22` } : {}}
            >
              <div className="relative">
                <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-16 h-16 object-contain rounded-xl relative z-10" />
                {activeIdx === i && (
                  <motion.div layoutId="thumb-glow" className="absolute inset-0 blur-xl opacity-50 z-0" style={{ background: getAccent(p.brand).color }} />
                )}
              </div>
              <span className="text-xs font-heading font-bold tracking-tight" style={{ color: activeIdx === i ? getAccent(p.brand).color : undefined }}>
                {p.name.split(" ").slice(-2).join(" ")}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setActiveIdx((activeIdx - 1 + products.length) % products.length)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-primary/20 transition-all duration-200 hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveIdx((activeIdx + 1) % products.length)}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-primary/20 transition-all duration-200 hover:text-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
