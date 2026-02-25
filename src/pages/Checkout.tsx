import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, ShieldCheck, AlertCircle } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { orderBusiness } from "@/business/orderBusiness";
import { cartBusiness } from "@/business/cartBusiness";
import { checkoutFormSchema, validate } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-DZ").format(price) + " DA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // 1. Validate form with Zod
    const validation = validate(checkoutFormSchema, form);
    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez corriger les champs en erreur",
        variant: "destructive",
      });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      // 2. Validate stock availability
      const stockCheck = await cartBusiness.validateCartStock(items);
      if (!stockCheck.valid) {
        toast({
          title: "Stock insuffisant",
          description: stockCheck.errors.join("\n"),
          variant: "destructive",
        });
        return;
      }

      // 3. Place order via business layer
      const result = await orderBusiness.placeOrder(items, validation.data!);

      // 4. Clear cart and navigate to confirmation
      clearCart();
      toast({
        title: "✅ Commande Confirmée !",
        description: `Numéro de commande: ${result.orderNumber}`,
      });
      navigate(`/order-confirmation/${result.orderNumber}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Impossible de passer la commande";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <h2 className="font-heading font-bold text-2xl mb-4">Panier Vide</h2>
          <p className="text-muted-foreground mb-6">Ajoutez des produits avant de passer commande.</p>
          <button onClick={() => navigate("/")} className="btn-cyber px-6 py-3 rounded-xl text-sm font-heading font-semibold">
            Retour à la Boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading font-bold text-3xl gradient-text mb-8">
          Finaliser la Commande
        </motion.h1>

        <div className="grid lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Informations de Livraison
              </h3>
              {[
                { label: "Nom Complet", key: "name", type: "text", required: true },
                { label: "Téléphone", key: "phone", type: "tel", required: true },
                { label: "Email (optionnel)", key: "email", type: "email", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[key as keyof typeof form]}
                    onChange={e => {
                      setForm(prev => ({ ...prev, [key]: e.target.value }));
                      if (fieldErrors[key]) {
                        setFieldErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-muted border text-sm outline-none transition-colors ${fieldErrors[key]
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary/50"
                      }`}
                  />
                  {fieldErrors[key] && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors[key]}
                    </p>
                  )}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-3">
              <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Paiement
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-heading font-semibold">Paiement à la Livraison</p>
                  <p className="text-xs text-muted-foreground">Espèces uniquement</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber py-4 rounded-xl text-base font-heading font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Confirmer la Commande · {formatPrice(totalPrice)}
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-4">
              <h3 className="font-heading font-semibold text-lg">Résumé</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-heading font-semibold text-primary whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-status-green text-xs font-medium">Gratuite</span>
                </div>
                <div className="flex justify-between text-lg font-heading font-bold pt-2 border-t border-border/30">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
