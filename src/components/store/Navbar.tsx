import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Heart, Menu, X, Smartphone, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useI18n } from "@/lib/i18n";
import { storeApi, StoreProduct } from "@/services/storeApi";
import { useAuth } from "@/hooks/useAuth";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StoreProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const { getTotalItems, setIsOpen } = useCartStore();
  const totalItems = getTotalItems();
  const { count: wishlistCount } = useWishlist();
  const { t, locale, setLocale } = useI18n();
  const { isAdmin: isSystemAdmin } = useAuth();

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

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await storeApi.fetchProducts({ search: searchQuery, limit: 6 });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isAdmin = location.pathname.startsWith("/admin");
  const formatPrice = (price: number) => new Intl.NumberFormat("fr-DZ").format(price) + " DA";

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.9, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"
          } `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between h-14 lg:h-16 px-6 rounded-full transition-all duration-500 ${scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-black/[0.04]"
              : "bg-transparent"
              } `}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center">
                <Smartphone className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight text-[#111111] leading-none">
                  Phone Store
                </span>
              </div>
            </Link>

            {/* Nav Links — Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: t('nav.home'), href: "/" },
                { label: t('nav.products'), href: "#featured" },
                { label: t('nav.categories'), href: "#categories" },
                { label: t('nav.contact'), href: "#inquiry" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-[13px] font-medium text-[#111111]/60 hover:text-[#111111] transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#111111] group-hover:w-full transition-all duration-500 ease-out" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search — Desktop */}
              <div ref={searchRef} className="relative hidden lg:block">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="ps-btn-icon"
                  aria-label={t('nav.search')}
                >
                  <Search style={{ width: 16, height: 16 }} />
                </button>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-3 w-80"
                    >
                      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.04]">
                          <Search style={{ width: 14, height: 14 }} className="text-[#111]/30" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('nav.search')}
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-[#111]/30"
                            autoFocus
                          />
                        </div>
                        {searchResults.length > 0 && (
                          <div className="max-h-64 overflow-y-auto">
                            {searchResults.map((product) => (
                              <button
                                key={product.id}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.02] transition-colors text-left"
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                  // Scroll to featured section
                                  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#F2F2F2] flex-shrink-0 overflow-hidden">
                                  {product.image_url && (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-[#111] truncate">{product.name}</div>
                                  <div className="text-xs text-[#111]/40">{formatPrice(product.selling_price)}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchQuery && searchResults.length === 0 && !searching && (
                          <div className="px-4 py-6 text-center text-sm text-[#111]/30">
                            Aucun résultat
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')}
                className="ps-btn-icon hidden lg:flex"
                aria-label="Toggle language"
              >
                <span className="text-[11px] font-semibold">{locale === 'fr' ? 'AR' : 'FR'}</span>
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="ps-btn-icon hidden lg:flex relative"
                aria-label={t('nav.wishlist')}
              >
                <Heart style={{ width: 16, height: 16 }} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111] rounded-full text-[9px] font-semibold text-white flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="ps-btn-icon hidden lg:flex relative"
                aria-label={t('nav.cart')}
              >
                <ShoppingCart style={{ width: 16, height: 16 }} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111] rounded-full text-[9px] font-semibold text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Admin Link */}
              <Link
                to={isAdmin ? "/" : "/admin/login"}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium border border-black/[0.06] hover:bg-black/[0.02] transition-all duration-300"
              >
                {isAdmin ? t('nav.shop') : t('nav.admin')}
              </Link>

              {/* Mobile Menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden ps-btn-icon"
              >
                {menuOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.04] lg:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {[
                { label: t('nav.home'), href: "/" },
                { label: t('nav.products'), href: "#featured" },
                { label: t('nav.categories'), href: "#categories" },
                { label: t('nav.contact'), href: "#inquiry" },
              ].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-base font-medium text-[#111]/70 hover:text-[#111] py-3 border-b border-black/[0.04] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => { setLocale(locale === 'fr' ? 'ar' : 'fr'); }}
                  className="ps-btn-secondary flex-1 py-3 text-center text-sm"
                >
                  {locale === 'fr' ? 'العربية' : 'Français'}
                </button>
                <Link
                  to="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="ps-btn-secondary flex-1 py-3 text-center text-sm"
                >
                  {t('nav.wishlist')} ({wishlistCount})
                </Link>
              </div>
              <button
                onClick={() => { setMenuOpen(false); setIsOpen(true); }}
                className="ps-btn-primary mt-2 py-3 text-center text-sm"
              >
                {t('nav.cart')} ({totalItems})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
