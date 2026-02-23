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
import type { Product, Sale, Repair, RotationType, ProductType } from "@/lib/admin-types";
import { inventoryService } from "@/services/inventoryService";
import { accessoryService } from "@/services/accessoryService";
import { toast } from "sonner";

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
  "Analyse Accessoires",
  "Matrice des Modèles",
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
              {tab === "Analyse Accessoires" && <Zap className="w-4 h-4" />}
              {tab === "Matrice des Modèles" && <Database className="w-4 h-4" />}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { title: "Valeur Achat Stock", value: "42 500 000 DA", icon: Database, accent: "#94A3B8" },
                  { title: "Valeur Vente Stock", value: "50 790 000 DA", icon: DollarSign, accent: "#CBD5E1" },
                  { title: "Profit Théorique", value: "8 290 000 DA", icon: TrendingUp, accent: "#FFFFFF" },
                  { title: "Total Produits", value: "842", icon: Package, accent: "#64748B" },
                  { title: "Stock Critique", value: "12", icon: Zap, accent: "#E2E8F0" },
                ].map(({ title, value, icon: Icon, accent }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-3xl p-5 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-500"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 bg-white/5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{title}</span>
                    </div>
                    <div className="text-xl font-mono-tech font-bold text-white tracking-tight">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                      >
                        {value}
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Smart Insight Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-6 overflow-hidden relative"
              >
                <div className="flex items-center gap-2 text-primary whitespace-nowrap">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Smart Insights</span>
                </div>
                <div className="flex-1 flex gap-8 items-center overflow-x-auto no-scrollbar">
                  {[
                    "15 produits n'ont pas bougé depuis 45 jours",
                    "30% du capital est immobilisé dans les smartphones",
                    "Les protège-écrans sont en surstock",
                    "Marges accessoires en hausse de 5%"
                  ].map((insight, i) => (
                    <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[11px] text-muted-foreground">{insight}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0F] to-transparent pointer-events-none" />
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white italic tracking-wide uppercase tracking-widest">Répartition du Capital</h3>
                      <p className="text-xs text-muted-foreground font-mono-tech mt-1">Par catégorie de produit (Monochrome View)</p>
                    </div>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Phones', value: 15400000 },
                        { name: 'Accessoires', value: 8900000 },
                        { name: 'Pièces', value: 4200000 },
                        { name: 'Réparations', value: 2100000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          contentStyle={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                        />
                        <Bar dataKey="value" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                      </BarChart>
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

          {activeTab === "Analyse Accessoires" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Capital Accessoires", value: "8 940 000 DA", icon: Database },
                  { title: "Marge Moyenne", value: "42%", icon: TrendingUp },
                  { title: "Rotation Rapide", value: "156 items", icon: Zap },
                  { title: "Accessoire Phare", value: "Case iPhone 15", icon: Star },
                ].map(({ title, value, icon: Icon }, i) => (
                  <div key={i} className="glass-card p-6 rounded-3xl border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{title}</span>
                    </div>
                    <div className="text-xl font-mono-tech font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 border-white/5">
                  <h3 className="text-xl font-heading font-bold text-white italic uppercase tracking-widest mb-10">Heatmap des Marges</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {['Protection', 'Charge', 'Audio', 'Style'].map((cat) => (
                      <div key={cat} className="space-y-4">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold text-center">{cat}</div>
                        {[45, 38, 52, 28].map((margin, j) => (
                          <div
                            key={j}
                            style={{ opacity: margin / 60 }}
                            className="h-12 bg-white/10 rounded-xl flex items-center justify-center text-[10px] font-bold text-white group cursor-help transition-all hover:bg-white/20"
                          >
                            {margin}%
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[2rem] p-8 border-white/5">
                  <h3 className="text-xl font-heading font-bold text-white italic uppercase tracking-widest mb-10">Rotation de Stock</h3>
                  <div className="space-y-6">
                    {[
                      { name: 'Câble Type-C Branded', rotation: 'high', stock: 42 },
                      { name: 'Coque Magsafe Clear', rotation: 'high', stock: 15 },
                      { name: 'Écouteurs Wired', rotation: 'slow', stock: 89 },
                      { name: 'Powerbank 10k', rotation: 'medium', stock: 24 },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground">Stock: {item.stock} units</div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${item.rotation === 'high' ? 'bg-white/20 text-white' :
                          item.rotation === 'medium' ? 'bg-white/10 text-muted-foreground' :
                            'bg-white/5 text-muted-foreground/50'
                          }`}>
                          {item.rotation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Matrice des Modèles" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-widest italic">Variant Matrix</h3>
                <div className="flex gap-2">
                  {['iPhone 15 Pro', 'iPhone 15 Pro Max', 'Galaxy S24'].map(model => (
                    <button key={model} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase hover:text-white transition-all">{model}</button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[2.5rem] p-8 border-white/5 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border border-white/5"></th>
                      {['128GB', '256GB', '512GB', '1TB'].map(storage => (
                        <th key={storage} className="p-4 border border-white/5 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{storage}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'].map(color => (
                      <tr key={color}>
                        <td className="p-4 border border-white/5 text-[10px] text-white uppercase font-bold tracking-widest">{color}</td>
                        {[2, 5, 0, 1].map((q, j) => (
                          <td
                            key={j}
                            onClick={() => q > 0 && toast.info(`IMEIs for ${color} - 256GB`)}
                            className={`p-4 border border-white/5 text-center cursor-pointer transition-all hover:bg-white/5 ${q === 0 ? 'bg-cyber-red/5' : ''}`}
                          >
                            <span className={`text-base font-mono-tech ${q === 0 ? 'text-cyber-red/50' : 'text-white'}`}>{q.toString().padStart(2, '0')}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                        const marginNet = Math.round(((p.selling_price - p.purchase_price) / (p.selling_price || 1)) * 100);
                        const rotation = inventoryService.detectRotation(p);
                        return (
                          <motion.tr
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-white/[0.01] transition-colors group cursor-pointer"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-bold text-primary border border-white/5 shadow-inner">
                                  {p.brand[0]}
                                </div>
                                <div>
                                  <input
                                    className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-primary/50 w-full"
                                    defaultValue={p.name}
                                    onBlur={(e) => {
                                      if (e.target.value !== p.name) {
                                        toast.success(`${p.name} mis à jour`);
                                      }
                                    }}
                                  />
                                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{p.brand} • {p.type || 'Phone'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-[11px] font-mono-tech text-white mb-1.5 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                {p.sku}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono-tech pl-3">
                                {p.imei || (p.imei_list ? `${p.imei_list.length} IMEIs` : 'No IMEI')}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-muted-foreground w-8 uppercase">Sale</span>
                                  <input
                                    className="bg-transparent text-xs font-bold text-white font-mono-tech focus:outline-none focus:border-b border-primary/50 w-20"
                                    defaultValue={p.selling_price.toLocaleString()}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-muted-foreground w-8 uppercase">Buy</span>
                                  <span className="text-[10px] text-muted-foreground font-mono-tech">{p.purchase_price.toLocaleString()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col items-center gap-2">
                                <div className={`text-[10px] font-bold ${marginNet > 30 ? 'text-emerald-500' : 'text-primary'}`}>{marginNet}%</div>
                                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${marginNet > 30 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, marginNet)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <input
                                  className={`w-12 px-2 py-1.5 rounded-xl text-xs font-mono-tech font-bold bg-white/5 border border-white/5 focus:outline-none focus:border-primary/50 text-center ${p.quantity <= p.low_stock_threshold ? 'text-cyber-red' : 'text-white'}`}
                                  defaultValue={p.quantity.toString().padStart(2, '0')}
                                />
                                {p.quantity <= p.low_stock_threshold && (
                                  <div className="animate-pulse">
                                    <Zap className="w-3.5 h-3.5 text-cyber-red" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-white">{p.is_active ? 'Active' : 'Hidden'}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest w-fit ${rotation === 'high' ? 'bg-white/10 text-white' :
                                  rotation === 'medium' ? 'bg-white/5 text-muted-foreground' :
                                    'text-muted-foreground/50'
                                  }`}>
                                  {rotation} rotation
                                </div>
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

          {/* INVENTAIRE */}
          {activeTab === "Inventaire" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white italic uppercase tracking-widest">Inventory Snapshots</h3>
                  <p className="text-xs text-muted-foreground mt-1 lowercase">Compare capital distribution across time</p>
                </div>
                <button
                  onClick={() => {
                    inventoryService.createSnapshot();
                    toast.success("Snapshot créé avec succès");
                  }}
                  className="bg-primary text-background px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  Create New Snapshot
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-[2rem] p-8 border-white/5">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Comparison View</h3>
                    <div className="flex gap-2">
                      <select className="bg-white/5 border border-white/10 text-[10px] text-white px-2 py-1 rounded-lg outline-none">
                        <option>Current (Now)</option>
                      </select>
                      <span className="text-muted-foreground self-center">vs</span>
                      <select className="bg-white/5 border border-white/10 text-[10px] text-white px-2 py-1 rounded-lg outline-none">
                        <option>Snapshot #prev-482</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[
                      { cat: 'Phones', current: 15400000, prev: 14200000 },
                      { cat: 'Accessories', current: 8900000, prev: 9500000 },
                      { cat: 'Spare Parts', current: 4200000, prev: 4100000 },
                    ].map((item, i) => {
                      const diff = item.current - item.prev;
                      const percent = ((diff / item.prev) * 100).toFixed(1);
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-white uppercase">{item.cat}</span>
                            <span className={diff >= 0 ? 'text-emerald-500' : 'text-cyber-red'}>
                              {diff >= 0 ? '+' : ''}{percent}%
                            </span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-white/20" style={{ width: `${(item.prev / item.current) * 100}%` }} />
                            <div className={`h-full ${diff >= 0 ? 'bg-emerald-500' : 'bg-cyber-red'}`} style={{ width: '10%' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card rounded-[2rem] p-8 border-white/5 flex flex-col justify-center items-center text-center">
                  <Calculator className="w-12 h-12 text-muted-foreground/20 mb-6" />
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Strategic Insight</h4>
                  <p className="text-xs text-muted-foreground max-w-[300px] leading-relaxed">
                    Capital in accessories has decreased by 6% since the last snapshot, while phone inventory value rose. Consider rebalancing cable stock.
                  </p>
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

      {/* Command Palette (Mock UI) */}
      <div className="fixed inset-0 z-[100] bg-[#0A0A0F]/90 backdrop-blur-xl flex items-center justify-center p-4 opacity-0 pointer-events-none group-data-[active=true]:opacity-100 group-data-[active=true]:pointer-events-auto transition-all duration-300">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl bg-[#0F0F1A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              autoFocus
              placeholder="Search actions or products (Type 'add' to create, 'inv' for inventory)..."
              className="bg-transparent text-lg text-white outline-none w-full font-mono-tech"
            />
            <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-muted-foreground font-bold">ESC</div>
          </div>
          <div className="p-4 space-y-2">
            {[
              { icon: Plus, label: "Add New Product", key: "P" },
              { icon: FileText, label: "Generate Report", key: "R" },
              { icon: Database, label: "View Snapshots", key: "S" },
              { icon: Calculator, label: "Open POS", key: "O" },
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer group/action transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-white/5 group-hover/action:bg-primary/20 transition-colors">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover/action:text-primary" />
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{action.label}</span>
                </div>
                <div className="flex gap-1">
                  <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-muted-foreground font-bold border border-white/5">CTRL</span>
                  <span className="px-2 py-1 rounded bg-white/5 text-[9px] text-muted-foreground font-bold border border-white/5">{action.key}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
