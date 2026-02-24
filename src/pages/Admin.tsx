import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Star, Package,
  Bell, Settings, LogOut, Search, Smartphone, Zap, Calculator,
  Wrench, Database, FileText, Tag, Shield, Menu, X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Import Modular Components
import { DashboardModule } from "@/components/admin/DashboardModule";
import { SalesModule } from "@/components/admin/SalesModule";
import { ProductsModule } from "@/components/admin/ProductsModule";
import { InventoryModule } from "@/components/admin/InventoryModule";
import { FinanceModule } from "@/components/admin/FinanceModule";
import { SuppliersModule } from "@/components/admin/SuppliersModule";
import { CustomersModule } from "@/components/admin/CustomersModule";
import { RepairsModule } from "@/components/admin/RepairsModule";
import { PromotionsModule } from "@/components/admin/PromotionsModule";
import { AuditModule } from "@/components/admin/AuditModule";
import { SettingsModule } from "@/components/admin/SettingsModule";

const tabs = [
  { id: "dashboard", label: "Tableau de Bord", icon: TrendingUp },
  { id: "sales", label: "Ventes & POS", icon: Calculator },
  { id: "products", label: "Produits", icon: Package },
  { id: "inventory", label: "Stock & Inventaire", icon: Database },
  { id: "finance", label: "Finance & P&L", icon: FileText },
  { id: "suppliers", label: "Fournisseurs", icon: Users },
  { id: "customers", label: "Clients & Fidélité", icon: ShoppingBag },
  { id: "repairs", label: "Réparations", icon: Wrench },
  { id: "promotions", label: "Promotions & Offres", icon: Tag },
  { id: "audit", label: "Audit & Sécurité", icon: Shield },
  { id: "settings", label: "Paramètres", icon: Settings }
] as const;

type TabId = typeof tabs[number]["id"];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const renderModule = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardModule />;
      case "sales": return <SalesModule />;
      case "products": return <ProductsModule />;
      case "inventory": return <InventoryModule />;
      case "finance": return <FinanceModule />;
      case "suppliers": return <SuppliersModule />;
      case "customers": return <CustomersModule />;
      case "repairs": return <RepairsModule />;
      case "promotions": return <PromotionsModule />;
      case "audit": return <AuditModule />;
      case "settings": return <SettingsModule />;
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen flex bg-admin-bg text-admin-primary selection:bg-black/5 overflow-hidden admin-theme">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 border-r border-admin-border bg-admin-bg transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-24'}`}>
        <div className="p-6 border-b border-admin-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-admin-btn flex items-center justify-center shadow-lg shadow-black/10 shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="font-heading font-medium text-lg tracking-tight text-admin-title uppercase">Store</span>
                <div className="text-[10px] text-admin-secondary font-medium tracking-wider uppercase">Control Panel</div>
              </motion.div>
            )}
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-admin-primary"><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                ? "bg-admin-btn text-white shadow-lg shadow-black/10 scale-105"
                : "text-admin-secondary hover:text-admin-primary hover:bg-admin-border/50"
                }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {isSidebarOpen && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-admin-border">
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all duration-300 ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-admin-bg/80 backdrop-blur-md border-b border-admin-border px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:hidden text-admin-primary"><Menu className="w-6 h-6" /></button>
            <div>
              <h1 className="font-heading font-light text-xl text-admin-title uppercase tracking-[0.2em]">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-admin-secondary font-medium tracking-wider uppercase">Store Management System • Secure Session</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-admin-border/30 border border-admin-border rounded-2xl px-4 py-2 hover:border-admin-border/60 transition-all group">
              <Search className="w-4 h-4 text-admin-secondary mr-3 group-hover:text-admin-primary transition-colors" />
              <input type="text" placeholder="Recherche rapide..." className="bg-transparent text-xs outline-none text-admin-primary w-48 font-medium placeholder:text-admin-secondary/50 placeholder:font-normal" />
            </div>

            <button className="relative w-11 h-11 rounded-2xl bg-admin-card border border-admin-border flex items-center justify-center text-admin-secondary hover:text-admin-primary transition-all hover:scale-105 active:scale-95 group shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-admin-bg" />
              {/* Notification Pulse */}
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping opacity-75" />
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-admin-border">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-admin-title uppercase tracking-tighter">Administrateur</div>
                <div className="text-[9px] text-admin-secondary font-medium uppercase">Gestionnaire</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-admin-btn flex items-center justify-center text-sm font-medium text-white shadow-xl shadow-black/10 border border-admin-border hover:rotate-6 transition-all cursor-pointer">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-[1600px] mx-auto pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderModule()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Floating AI Command Badge */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-[2rem] bg-admin-card text-admin-primary flex items-center justify-center shadow-2xl z-50 group border-4 border-admin-border overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-black/5 to-white" />
          <Zap className="w-8 h-8 relative z-10 text-admin-btn group-hover:animate-bounce" />
          {/* Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.button>
      </main>
    </div>
  );
}
