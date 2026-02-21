import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-secondary/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card rounded-3xl p-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7 text-background" />
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-2xl gradient-text">Le Bon Coin</h1>
              <p className="text-sm text-muted-foreground mt-1">Console d'Administration</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-grotesk font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-grotesk font-medium text-muted-foreground uppercase tracking-wider">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber py-3.5 rounded-xl text-sm font-grotesk font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Se Connecter <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              ← Retour à la Boutique
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
