import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isOpen, setIsOpen, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-DZ").format(price) + " DA";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-strong z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-bold text-lg">Panier ({totalItems})</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
                  <div>
                    <p className="font-heading font-semibold text-foreground">Panier Vide</p>
                    <p className="text-sm text-muted-foreground mt-1">Ajoutez des produits pour commencer</p>
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
                    className="glass-card rounded-2xl p-4 flex gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-sm text-foreground truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.brand}{item.color ? ` · ${item.color}` : ""}</p>
                      <p className="text-sm font-heading font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-mono-tech w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border/30 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-heading font-bold gradient-text">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  onClick={() => { setIsOpen(false); navigate("/checkout"); }}
                  className="w-full btn-cyber py-3.5 rounded-xl text-sm font-heading font-semibold flex items-center justify-center gap-2"
                >
                  Passer la Commande <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-2.5 rounded-xl text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Vider le panier
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
