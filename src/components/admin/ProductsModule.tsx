import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, Download, MoreVertical, Zap } from "lucide-react";
import { productsService } from "@/services/admin/productsService";
import { exportService } from "@/services/admin/exportService";
import { SearchBar } from "./shared/SearchBar";
import type { Product } from "@/lib/admin-types";
import { toast } from "sonner";

export function ProductsModule() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '', brand: '', type: 'phone', purchase_price: 0, selling_price: 0,
        quantity: 0, low_stock_threshold: 5, is_active: true, is_featured: false,
    });

    const loadProducts = async () => {
        try {
            const data = await productsService.getAll();
            setProducts(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadProducts(); }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async () => {
        try {
            await productsService.create(newProduct);
            toast.success("Produit créé");
            setShowAddForm(false);
            setNewProduct({ name: '', brand: '', type: 'phone', purchase_price: 0, selling_price: 0, quantity: 0, low_stock_threshold: 5, is_active: true, is_featured: false });
            loadProducts();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleUpdate = async (id: string, field: string, value: any) => {
        try {
            await productsService.update(id, { [field]: value });
            toast.success("Mis à jour");
            loadProducts();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce produit ?")) return;
        try {
            await productsService.deleteProduct(id);
            toast.success("Supprimé");
            loadProducts();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const result = await productsService.importCSV(text);
        if (result.errors.length > 0) {
            toast.warning(`${result.imported} importé(s), ${result.errors.length} erreur(s)`);
            result.errors.forEach(err => toast.error(err));
        } else {
            toast.success(`${result.imported} produit(s) importé(s)`);
        }
        loadProducts();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCSVExport = () => {
        const csv = productsService.exportToCSV(products);
        exportService.downloadCSV(csv, `products-${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="w-full lg:max-w-xl">
                    <SearchBar value={search} onChange={setSearch} placeholder="Filtrer par nom, SKU ou marque..." />
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    <button onClick={() => fileInputRef.current?.click()}
                        className="flex-1 lg:flex-none glass border border-black/5 px-4 py-3 rounded-2xl text-[10px] font-medium text-[#111111] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 transition-all">
                        <Upload className="w-4 h-4" /> Importer CSV
                    </button>
                    <button onClick={handleCSVExport}
                        className="flex-1 lg:flex-none glass border border-black/5 px-4 py-3 rounded-2xl text-[10px] font-medium text-[#111111] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 transition-all">
                        <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                    <button onClick={() => setShowAddForm(!showAddForm)}
                        className="flex-1 lg:flex-none bg-primary text-background px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20">
                        <Plus className="w-5 h-5" /> Ajouter
                    </button>
                </div>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="glass-card rounded-3xl p-8 border-white/5 space-y-4">
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">Nouveau Produit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Nom', key: 'name', type: 'text' },
                            { label: 'Marque', key: 'brand', type: 'text' },
                            { label: 'SKU', key: 'sku', type: 'text' },
                            { label: 'Code-barres', key: 'barcode', type: 'text' },
                            { label: 'Prix achat', key: 'purchase_price', type: 'number' },
                            { label: 'Prix vente', key: 'selling_price', type: 'number' },
                            { label: 'Quantité', key: 'quantity', type: 'number' },
                            { label: 'Seuil alerte', key: 'low_stock_threshold', type: 'number' },
                            { label: 'Couleur', key: 'color', type: 'text' },
                            { label: 'Stockage', key: 'storage_capacity', type: 'text' },
                            { label: 'Fournisseur', key: 'supplier', type: 'text' },
                        ].map(({ label, key, type }) => (
                            <div key={key} className="space-y-1">
                                <label className="text-[10px] text-black/40 uppercase font-medium tracking-widest">{label}</label>
                                <input type={type}
                                    value={newProduct[key as keyof Product] as string || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                                    className="w-full bg-black/5 border border-black/5 rounded-xl py-2.5 px-3 text-sm text-[#111111] outline-none focus:border-black/20" />
                            </div>
                        ))}
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Type</label>
                            <select value={newProduct.type || 'phone'}
                                onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white outline-none">
                                <option value="phone">Téléphone</option>
                                <option value="accessory">Accessoire</option>
                                <option value="spare_part">Pièce détachée</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={handleCreate}
                            className="bg-primary text-background px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all">Créer</button>
                        <button onClick={() => setShowAddForm(false)}
                            className="glass border border-white/10 px-8 py-3 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all">Annuler</button>
                    </div>
                </motion.div>
            )}

            {/* Products Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-black/5 bg-white shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black/[0.02] border-b border-black/5">
                                <th className="text-left px-6 py-5 text-[10px] font-medium text-black/40 uppercase tracking-widest">Produit</th>
                                <th className="text-left px-6 py-5 text-[10px] font-medium text-black/40 uppercase tracking-widest">SKU / Code-barres</th>
                                <th className="text-left px-6 py-5 text-[10px] font-medium text-black/40 uppercase tracking-widest">Prix</th>
                                <th className="text-left px-6 py-5 text-[10px] font-medium text-black/40 uppercase tracking-widest text-center">Marge</th>
                                <th className="text-left px-6 py-5 text-[10px] font-medium text-black/40 uppercase tracking-widest">Stock</th>
                                <th className="text-left px-6 py-5 text-[10px] font-medium text-black/40 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((p, i) => {
                                const margin = productsService.calculateMargin(p.purchase_price, p.selling_price);
                                const rotation = productsService.detectRotation(p);
                                return (
                                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-xs font-medium text-black border border-black/5">
                                                    {p.brand[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-[#111111]">{p.name}</div>
                                                    <div className="text-[10px] text-black/40 uppercase tracking-widest">{p.brand} • {p.type || 'phone'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[11px] font-mono-tech text-white">{p.sku}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono-tech">{p.barcode || '—'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-white font-mono-tech">{p.selling_price.toLocaleString()} DA</div>
                                            <div className="text-[10px] text-muted-foreground font-mono-tech">{p.purchase_price.toLocaleString()} DA</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-[11px] font-bold ${margin > 30 ? 'text-emerald-500' : margin > 15 ? 'text-white' : 'text-amber-500'}`}>{margin}%</div>
                                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mx-auto mt-1">
                                                <div className={`h-full ${margin > 30 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, margin)}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-mono-tech font-bold ${p.quantity <= p.low_stock_threshold ? 'text-red-400' : 'text-white'}`}>
                                                    {p.quantity}
                                                </span>
                                                {p.quantity <= p.low_stock_threshold && <Zap className="w-3 h-3 text-red-400 animate-pulse" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white">{p.is_active ? 'Active' : 'Masqué'}</span>
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest ${rotation === 'high' ? 'text-emerald-500' : rotation === 'medium' ? 'text-white/70' : rotation === 'slow' ? 'text-amber-500' : 'text-red-400'
                                                    }`}>{rotation} rotation</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleUpdate(p.id, 'is_active', !p.is_active)}
                                                    className="text-[9px] font-bold text-muted-foreground hover:text-white px-2 py-1 rounded-lg hover:bg-white/5">
                                                    {p.is_active ? 'Masquer' : 'Activer'}
                                                </button>
                                                <button onClick={() => handleDelete(p.id)}
                                                    className="text-[9px] font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-white/5 text-center">
                    <span className="text-[10px] text-muted-foreground font-mono-tech">{filtered.length} produit(s) affichés sur {products.length} total</span>
                </div>
            </div>
        </motion.div>
    );
}
