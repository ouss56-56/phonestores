import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, User, Menu, X, Smartphone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Produits", href: "#gallery" },
  { label: "Caractéristiques", href: "#features" },
  { label: "Avis", href: "#reviews" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      setHidden(currentY > lastScrollY && currentY > 200);
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? "py-4" : "py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 lg:h-20 px-8 rounded-full transition-all duration-700 border border-white/5 ${scrolled ? "glass-strong shadow-premium" : "bg-transparent border-transparent"
            }`}>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-gold">
                  <Smartphone className="w-5 h-5 text-background" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-secondary opacity-20 blur-xl group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight italic gradient-text leading-none">
                  Lumina
                </span>
                <span className="text-[8px] font-heading font-bold tracking-[0.4em] uppercase text-primary/70 leading-none mt-1">
                  Elite Mobile
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground/80 hover:text-primary transition-colors duration-500 group"
                >
                  {link.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1.5px] bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-700 ease-out" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full glass hover:border-primary/30 transition-all duration-500 text-muted-foreground hover:text-primary shadow-premium">
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full glass hover:border-primary/30 transition-all duration-500 text-muted-foreground hover:text-primary relative shadow-premium"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-full text-[10px] font-bold text-background flex items-center justify-center shadow-gold">
                    {totalItems}
                  </span>
                )}
              </button>
              <Link
                to={isAdmin ? "/" : "/admin/login"}
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold font-heading tracking-[0.2em] uppercase transition-all duration-500 btn-ghost-cyber shadow-premium border-white/5 hover:border-primary/40"
              >
                <User className="w-3.5 h-3.5" />
                {isAdmin ? "Shop" : "Elite Access"}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full glass text-muted-foreground hover:text-primary transition-colors shadow-premium"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 z-40 glass-strong border-b border-primary/5 lg:hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border/30"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <button
                onClick={() => { setMenuOpen(false); setIsOpen(true); }}
                className="btn-cyber text-center py-3 rounded-full text-sm font-semibold"
              >
                Panier ({totalItems})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
