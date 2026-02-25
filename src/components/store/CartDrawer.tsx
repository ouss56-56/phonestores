import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { recommendationBusiness } from "@/business/recommendationBusiness";
import { StoreProduct } from "@/services/storeApi";
import { toast } from "@/hooks/use-toast";

export default function CartDrawer() {
  const { items, addItem, removeItem, updateQuantity, getTotalItems, getTotalPrice, isOpen, setIsOpen, clearCart } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const navigate = useNavigate();
  const { t } = useI18n();

  const { data: upsells = [] } = useQuery({
    queryKey: ['cart-upsells'],
    queryFn: () => recommendationBusiness.getRecommendedUpsells(3),
  });

  const handleAddUpsell = (product: any) => {
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-DZ").format(price) + " DA";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.06)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/[0.04]">
              <div className="flex items-center gap-3">
                <ShoppingBag style={{ width: 18, height: 18 }} className="text-[#111]" />
                <h2 className="font-medium text-base text-[#111]">
                  {t('cart.title')} ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ps-btn-icon w-9 h-9"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <ShoppingBag style={{ width: 48, height: 48 }} className="text-[#111]/10" />
                  <div>
                    <p className="font-medium text-[#111]">{t('cart.empty')}</p>
                    <p className="text-sm text-[#111]/30 mt-1">{t('cart.emptyDesc')}</p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4 p-3 rounded-xl bg-[#F8F8F8] border border-black/[0.03]"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag style={{ width: 20, height: 20 }} className="text-[#111]/10" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[#111] truncate">{item.name}</h4>
                      <p className="text-[11px] text-[#111]/30">{item.brand}{item.color ? ` · ${item.color}` : ""}</p>
                      <p className="text-sm font-semibold text-[#111] mt-1">{formatPrice(item.price)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#111]/20 hover:text-red-500 transition-colors"
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#111]/50 hover:text-[#111] transition-colors"
                        >
                          <Minus style={{ width: 12, height: 12 }} />
                        </button>
                        <span className="text-sm font-medium w-5 text-center text-[#111]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#111]/50 hover:text-[#111] transition-colors"
                        >
                          <Plus style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Upsell Section */}
              {items.length > 0 && upsells.length > 0 && (
                <div className="mt-8 pt-8 border-t border-black/[0.04]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#111]/40 mb-4">Complétez votre achat</h3>
                  <div className="space-y-3">
                    {upsells.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl border border-black/[0.03] bg-white group hover:border-[#111]/20 transition-all">
                        <div className="w-12 h-12 rounded-lg bg-[#F8F8F8] flex items-center justify-center overflow-hidden">
                          <img src={p.image_url || ""} alt={p.name} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-medium text-[#111] truncate">{p.name}</h4>
                          <p className="text-[10px] text-[#111]/40">{formatPrice(p.selling_price)}</p>
                        </div>
                        <button
                          onClick={() => handleAddUpsell(p)}
                          className="w-8 h-8 rounded-full bg-[#111]/5 flex items-center justify-center text-[#111] hover:bg-[#111] hover:text-white transition-all transform active:scale-95"
                        >
                          <Plus style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-black/[0.04] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#111]/40">{t('cart.total')}</span>
                  <span className="text-xl font-semibold text-[#111]">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  onClick={() => { setIsOpen(false); navigate("/checkout"); }}
                  className="ps-btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                >
                  {t('cart.checkout')} <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-[#111]/25 hover:text-red-400 transition-colors"
                >
                  {t('cart.clear')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
