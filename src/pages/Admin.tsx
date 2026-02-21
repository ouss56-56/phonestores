import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  TrendingUp, Users, ShoppingBag, DollarSign, Star, Package, Eye, MoreVertical,
  CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownRight, Bell,
  Settings, LogOut, Search, Filter, Smartphone, Zap, Calculator,
  Wrench, ClipboardList, Database, FileText, Plus, Minus, Trash2, Printer
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import type { Product, Sale, Repair } from "@/lib/admin-types";

const salesData = [
  { month: "Jan", revenue: 4200000, orders: 38 },
  { month: "Fév", revenue: 5800000, orders: 52 },
  { month: "Mar", revenue: 5100000, orders: 44 },
  { month: "Avr", revenue: 7200000, orders: 64 },
  { month: "Mai", revenue: 8900000, orders: 78 },
  { month: "Jun", revenue: 9500000, orders: 85 },
  { month: "Jul", revenue: 11200000, orders: 97 },
  { month: "Aoû", revenue: 13400000, orders: 115 },
];

const initialProducts: Product[] = [
  { id: "1", name: "iPhone 15 Pro Max", sku: "APL-15PM-256", imei: "354678123456789", brand: "Apple", purchase_price: 130000, selling_price: 149990, quantity: 12, low_stock_threshold: 5, is_active: true, is_featured: true, category: "Phones" },
  { id: "2", name: "Galaxy S24 Ultra", sku: "SAM-S24U-512", imei: "358234908765432", brand: "Samsung", purchase_price: 120000, selling_price: 139990, quantity: 28, low_stock_threshold: 10, is_active: true, is_featured: true, category: "Phones" },
  { id: "3", name: "iPhone 15 Pro", sku: "APL-15P-128", imei: "351234567890123", brand: "Apple", purchase_price: 110000, selling_price: 129990, quantity: 2, low_stock_threshold: 5, is_active: true, is_featured: true, category: "Phones" },
];

const tabs = [
  "Tableau de bord",
  "Point de Vente (POS)",
  "Produits",
  "Inventaire",
  "Réparations",
  "Clients",
  "Rapports Financiers",
  "Avis",
  "Paramètres"
] as const;
type Tab = typeof tabs[number];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("Tableau de bord");
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posSearch, setPosSearch] = useState("");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const generateInvoice = (sale: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(15, 15, 30);
    doc.text("LUMINA LUXURY TECH", 20, 30);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("FACTURE PRO-FORMA", 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 40);

    doc.line(20, 45, 190, 45);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Détails de la Vente:", 20, 60);

    let yPos = 70;
    posCart.forEach((item, i) => {
      doc.text(`${item.name}`, 20, yPos);
      doc.text(`${item.selling_price.toLocaleString()} DA`, 160, yPos, { align: "right" });
      yPos += 10;
    });

    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(14);
    const total = posCart.reduce((acc, curr) => acc + curr.selling_price, 0);
    doc.text("TOTAL:", 20, yPos);
    doc.text(`${total.toLocaleString()} DA`, 160, yPos, { align: "right" });

    doc.save(`Lumina-Facture-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0F] text-foreground selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 glass-strong fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-tight text-white">LUMINA</span>
              <div className="text-[10px] text-primary font-mono-tech tracking-wider uppercase font-bold">ADMIN CONSOLE</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab
                ? "bg-primary/10 text-primary border border-primary/20 shadow-inner"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
            >
              {tab === "Tableau de bord" && <TrendingUp className="w-4 h-4" />}
              {tab === "Point de Vente (POS)" && <Calculator className="w-4 h-4" />}
              {tab === "Produits" && <Package className="w-4 h-4" />}
              {tab === "Inventaire" && <Database className="w-4 h-4" />}
              {tab === "Réparations" && <Wrench className="w-4 h-4" />}
              {tab === "Clients" && <Users className="w-4 h-4" />}
              {tab === "Rapports Financiers" && <FileText className="w-4 h-4" />}
              {tab === "Avis" && <Star className="w-4 h-4" />}
              {tab === "Paramètres" && <Settings className="w-4 h-4" />}
              <span className="truncate">{tab}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-cyber-red bg-cyber-red/5 hover:bg-cyber-red/10 border border-cyber-red/10 transition-all duration-300">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-xl text-white italic tracking-tight uppercase tracking-widest">{activeTab}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-mono-tech tracking-wider uppercase">Système Connecté • Session Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-muted-foreground mr-2" />
              <input type="text" placeholder="Recherche globale..." className="bg-transparent text-xs outline-none text-white w-40" />
            </div>
            <button className="relative w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-105 active:scale-95">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyber-red border-2 border-[#0A0A0F]" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white uppercase tracking-tighter">Admin Principal</div>
                <div className="text-[9px] text-primary font-mono-tech">ID: #SYS-001</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-secondary/10 border border-white/10">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
          {/* OVERVIEW / Tableau de bord */}
          {activeTab === "Tableau de bord" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Chiffre d'Affaires", value: "65 420 000 DA", change: "+18.2%", up: true, icon: DollarSign, accent: "#FB923C" },
                  { title: "Ventes POS", value: "12 840 000 DA", change: "+42.5%", up: true, icon: Calculator, accent: "#7B68EE" },
                  { title: "Commandes", value: "573", change: "+12.5%", up: true, icon: ShoppingBag, accent: "#00FF88" },
                  { title: "Note Client", value: "4.9/5", change: "+0.2", up: true, icon: Star, accent: "#FFB800" },
                ].map(({ title, value, change, up, icon: Icon, accent }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-3xl p-6 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-500"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-700">
                      <Icon className="w-16 h-16" style={{ color: accent }} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5" style={{ background: `${accent}15` }}>
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-mono-tech">{title}</span>
                    </div>
                    <div className="text-2xl font-mono-tech font-bold text-white mb-2 tracking-tight">{value}</div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${up ? "text-emerald-500" : "text-cyber-red"}`}>
                      <div className={`p-0.5 rounded ${up ? "bg-emerald-500/10" : "bg-cyber-red/10"}`}>
                        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </div>
                      {change} <span className="text-muted-foreground ml-1 font-normal font-sans italic opacity-60">vs mois dernier</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="w-32 h-32 text-primary" />
                  </div>
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white italic tracking-wide uppercase tracking-widest">Performance Volume</h3>
                      <p className="text-xs text-muted-foreground font-mono-tech mt-1">Données agrégées mensuelles</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold px-3 py-1.5 text-white uppercase hover:bg-white/10 transition-all">Export</button>
                      <button className="bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold px-3 py-1.5 text-primary uppercase">Mise à jour</button>
                    </div>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FB923C" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          cursor={{ stroke: '#FB923C', strokeWidth: 1 }}
                          contentStyle={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#FB923C', fontWeight: 800, fontSize: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#FB923C" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-[2rem] p-8 border-white/5 space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                    <h3 className="text-xl font-heading font-bold text-white italic uppercase tracking-widest">Lumina Insights</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { type: "warning", title: "Stock Critique", text: "L'iPhone 15 Pro est presque épuisé (2 restants).", action: "Réapprovisionner", color: "amber" },
                      { type: "success", title: "Optimisation Prix", text: "La marge sur 'Accessoires' peut être augmentée de 5% sans affecter la demande.", action: "Appliquer", color: "emerald" },
                      { type: "info", title: "Rapport Prêt", text: "Le bilan financier de Février est prêt pour exportation.", action: "Télécharger", color: "blue" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`bg-${item.color}-500/5 border border-${item.color}-500/20 p-5 rounded-3xl group cursor-pointer hover:bg-${item.color}-500/10 transition-all`}
                      >
                        <div className={`text-[10px] font-bold text-${item.color}-500 uppercase mb-1 tracking-widest`}>{item.title}</div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{item.text}</p>
                        <button className={`text-[10px] font-bold text-${item.color}-500 uppercase flex items-center gap-1 group-hover:gap-2 transition-all`}>
                          {item.action} <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Point de Vente (POS) */}
          {activeTab === "Point de Vente (POS)" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-14rem)]">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Scanner Code-barres ou rechercher un smartphone..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-primary/50 transition-all font-mono-tech shadow-inner"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                    />
                  </div>
                  <button className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all text-muted-foreground hover:text-white">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {initialProducts.map((p, i) => (
                      <motion.button
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setPosCart([...posCart, { ...p, cartId: Date.now() }])}
                        className="glass-card p-6 rounded-[2rem] border-white/5 hover:border-primary/40 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{p.brand}</span>
                            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase italic">En Stock</span>
                          </div>
                          <div className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono-tech mb-6">{p.sku}</div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Prix de vente</div>
                              <div className="text-xl font-mono-tech font-bold text-white">{p.selling_price.toLocaleString()} DA</div>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-background group-hover:border-primary transition-all">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[2.5rem] border-white/5 flex flex-col relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-heading font-bold text-white flex items-center gap-3 uppercase tracking-widest italic">
                    <Calculator className="w-6 h-6 text-primary" /> Session POS
                  </h3>
                  <button onClick={() => setPosCart([])} className="text-[10px] font-bold text-muted-foreground hover:text-cyber-red uppercase tracking-widest">Vider</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
                  {posCart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic opacity-30 text-center px-10">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-heading font-bold uppercase tracking-widest">Le panier est vierge</p>
                      <p className="text-[10px] mt-2 font-normal lowercase">Ajoutez des produits pour commencer la facturation</p>
                    </div>
                  ) : (
                    posCart.map((item, idx) => (
                      <motion.div
                        key={item.cartId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white mb-0.5">{item.name}</div>
                          <div className="text-[9px] text-muted-foreground font-mono-tech uppercase">{item.sku}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xs font-bold text-primary font-mono-tech">{item.selling_price.toLocaleString()} DA</div>
                          <button
                            onClick={() => setPosCart(posCart.filter((_, i) => i !== idx))}
                            className="bg-cyber-red/10 text-cyber-red p-2 rounded-xl border border-cyber-red/10 hover:bg-cyber-red/20 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-8 bg-[#0F0F1A]/80 border-t border-white/10 backdrop-blur-xl">
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-widest">Sous-total</span>
                      <span className="font-mono-tech text-sm">{posCart.reduce((acc, curr) => acc + curr.selling_price, 0).toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-widest">TVA (0.00%)</span>
                      <span className="font-mono-tech text-sm">0 DA</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white uppercase tracking-widest italic">Total Final</span>
                      <span className="text-2xl font-mono-tech font-bold text-primary shadow-primary/20 drop-shadow-xl">
                        {posCart.reduce((acc, curr) => acc + curr.selling_price, 0).toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={posCart.length === 0}
                    onClick={() => generateInvoice({})}
                    className="w-full bg-primary text-background py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                  >
                    <Printer className="w-5 h-5" />
                    <span className="uppercase tracking-widest">Générer la Facture PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRODUITS */}
          {activeTab === "Produits" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="relative w-full lg:max-w-xl">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    placeholder="Filtrer l'inventaire par nom, SKU ou IMEI..."
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-primary/50 transition-all font-mono-tech shadow-inner"
                  />
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <button className="flex-1 lg:flex-none glass border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    <Filter className="w-4 h-4" /> Filtres
                  </button>
                  <button className="flex-1 lg:flex-none bg-primary text-background px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20">
                    <Plus className="w-5 h-5" /> Ajouter un Article
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/5">
                        <th className="text-left px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Produit & Marque</th>
                        <th className="text-left px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono-tech">Identifiants SKU/IMEI</th>
                        <th className="text-left px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Analyse Prix</th>
                        <th className="text-left px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Marge Net</th>
                        <th className="text-left px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stock Reel</th>
                        <th className="text-left px-8 py-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Statut</th>
                        <th className="px-8 py-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {initialProducts.map((p, i) => {
                        const marginNet = Math.round(((p.selling_price - p.purchase_price) / p.selling_price) * 100);
                        return (
                          <motion.tr
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-white/[0.01] transition-colors group"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-bold text-primary border border-white/5 shadow-inner">
                                  {p.brand[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{p.name}</div>
                                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{p.brand}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-[11px] font-mono-tech text-white mb-1.5 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {p.sku}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono-tech pl-3">{p.imei}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-sm font-bold text-white font-mono-tech">{p.selling_price.toLocaleString()} DA</div>
                              <div className="text-[9px] text-muted-foreground font-mono-tech italic">Achat: {p.purchase_price.toLocaleString()} DA</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col items-center gap-2">
                                <div className={`text-[10px] font-bold ${marginNet > 20 ? 'text-emerald-500' : 'text-primary'}`}>{marginNet}%</div>
                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${marginNet > 20 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${marginNet}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className={`px-3 py-1.5 rounded-xl text-xs font-mono-tech font-bold ${p.quantity <= p.low_stock_threshold ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/20' : 'bg-white/5 text-white'}`}>
                                  {p.quantity.toString().padStart(2, '0')}
                                </div>
                                {p.quantity <= p.low_stock_threshold && (
                                  <div className="animate-pulse">
                                    <Zap className="w-3.5 h-3.5 text-cyber-red" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white">{p.is_active ? 'Visible' : 'Archivé'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button className="text-muted-foreground hover:text-white transition-all p-3 rounded-xl hover:bg-white/5 active:scale-90">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* INVENTAIRE (Simplified for now) */}
          {activeTab === "Inventaire" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 border-white/5">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-heading font-bold text-white italic uppercase tracking-widest">Mouvements de Stock</h3>
                    <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase">Nouveau Transfert</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { type: "entrée", product: "iPhone 15 Pro Max", qty: "+10", date: "Aujourd'hui, 09:41", user: "Karim" },
                      { type: "sortie", product: "Galaxy S24 Ultra", qty: "-01", date: "Hier, 17:20", user: "POS Terminal" },
                    ].map((m, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${m.type === 'entrée' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-cyber-red/10 text-cyber-red'}`}>
                            {m.type === 'entrée' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{m.product}</div>
                            <div className="text-[10px] text-muted-foreground">{m.date} • Opérateur: {m.user}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-mono-tech font-bold ${m.type === 'entrée' ? 'text-emerald-500' : 'text-cyber-red'}`}>{m.qty}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card rounded-[2rem] p-8 border-white/5">
                  <h3 className="text-xl font-heading font-bold text-white italic uppercase tracking-widest mb-10">Valeur Stock</h3>
                  <div className="space-y-8">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Valeur d'Achat</div>
                      <div className="text-3xl font-mono-tech font-bold text-white">42 500 000 DA</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Profit Potentiel</div>
                      <div className="text-3xl font-mono-tech font-bold text-emerald-500">+8 290 000 DA</div>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                      <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all">Inventaire Physique Manuel</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RÉPARATIONS (Simplified for now) */}
          {activeTab === "Réparations" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                  { id: "REP-992", model: "iPhone 13 Pro", problem: "Écran brisé", status: "In Progress", color: "amber", customer: "Amine K." },
                  { id: "REP-991", model: "Galaxy S22", problem: "Batterie gonflée", status: "Pending", color: "blue", customer: "Sabrina L." },
                ].map((rep, i) => (
                  <div key={rep.id} className="glass-card rounded-[2.5rem] p-8 border-white/5 overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[10px] text-primary font-mono-tech font-bold uppercase tracking-widest mb-1">Dossier {rep.id}</div>
                        <div className="text-lg font-bold text-white group-hover:text-primary transition-colors">{rep.model}</div>
                        <div className="text-xs text-muted-foreground">Client: {rep.customer}</div>
                      </div>
                      <span className={`bg-${rep.color}-500/10 text-${rep.color}-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase`}>{rep.status}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl mb-6">
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Diagnostic</div>
                      <div className="text-xs text-white">"{rep.problem}"</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-white/10 text-white py-3 rounded-xl text-[10px] font-bold uppercase hover:bg-white/20 transition-all">Mettre à jour</button>
                      <button className="bg-white/5 p-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10"><Printer className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Fallback for other tabs */}
          {!["Tableau de bord", "Point de Vente (POS)", "Produits", "Inventaire", "Réparations"].includes(activeTab) && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/5 rounded-[3rem]">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="font-heading font-bold text-xl uppercase tracking-widest mb-2">Module en Développement</h3>
              <p className="text-xs font-mono-tech italic">Fonctionnalité prévue pour la Phase 2 de l'implémentation.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
