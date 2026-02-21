import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-DZ").format(price) + " DA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || null,
          notes: form.notes || null,
          total_amount: totalPrice,
          order_number: "LBC-" + Date.now(),
          status: "pending",
          payment_method: "cash",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of items) {
        await supabase.rpc("has_role", { _user_id: "00000000-0000-0000-0000-000000000000", _role: "admin" });
        // We'll update stock via admin later
      }

      clearCart();
      toast({
        title: "✅ Commande Confirmée !",
        description: `Numéro de commande: ${order.order_number}`,
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Impossible de passer la commande", variant: "destructive" });
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
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:border-primary/50 transition-colors"
                  />
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
