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
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
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
                        className="flex-1 lg:flex-none bg-admin-card border border-admin-border px-4 py-3 rounded-2xl text-[10px] font-medium text-admin-primary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-admin-bg transition-all shadow-sm">
                        <Upload className="w-4 h-4" /> Importer CSV
                    </button>
                    <button onClick={handleCSVExport}
                        className="flex-1 lg:flex-none bg-admin-card border border-admin-border px-4 py-3 rounded-2xl text-[10px] font-medium text-admin-primary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-admin-bg transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                    <button onClick={() => setShowAddForm(!showAddForm)}
                        className="flex-1 lg:flex-none bg-admin-btn text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-black/10">
                        <Plus className="w-5 h-5" /> Ajouter
                    </button>
                </div>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-admin-card rounded-[2rem] p-8 border border-admin-border space-y-6 shadow-sm">
                    <h3 className="text-lg font-bold text-admin-title uppercase tracking-widest">Nouveau Produit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <div key={key} className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">{label}</label>
                                <input type={type}
                                    value={newProduct[key as keyof Product] as string || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                                    className="w-full bg-admin-bg border border-admin-border rounded-xl py-3 px-4 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all" />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest">Type</label>
                            <select value={newProduct.type || 'phone'}
                                onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as any })}
                                className="w-full bg-admin-bg border border-admin-border rounded-xl py-3 px-4 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all">
                                <option value="phone">Téléphone</option>
                                <option value="accessory">Accessoire</option>
                                <option value="spare_part">Pièce détachée</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleCreate}
                            className="bg-admin-btn text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10">Créer</button>
                        <button onClick={() => setShowAddForm(false)}
                            className="bg-admin-card border border-admin-border px-8 py-3 rounded-xl text-[10px] font-bold text-admin-primary uppercase tracking-widest hover:bg-admin-bg transition-all">Annuler</button>
                    </div>
                </motion.div>
            )}

            {/* Products Table */}
            <div className="bg-admin-card rounded-[2.5rem] overflow-hidden border border-admin-border shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-admin-bg/50 border-b border-admin-border">
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Produit</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">SKU / Code-barres</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Prix</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest text-center">Marge</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Stock</th>
                                <th className="text-left px-6 py-5 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filtered.map((p, i) => {
                                const margin = productsService.calculateMargin(p.purchase_price, p.selling_price);
                                const rotation = productsService.detectRotation(p);
                                return (
                                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.01 }}
                                        className="hover:bg-admin-bg/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-admin-bg flex items-center justify-center text-xs font-bold text-admin-primary border border-admin-border">
                                                    {p.brand[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-admin-title">{p.name}</div>
                                                    <div className="text-[10px] text-admin-secondary uppercase tracking-widest font-medium">{p.brand} • {p.type || 'phone'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[11px] font-mono-tech text-admin-primary font-bold">{p.sku}</div>
                                            <div className="text-[10px] text-admin-secondary font-mono-tech">{p.barcode || '—'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs font-bold text-admin-title font-mono-tech">{p.selling_price.toLocaleString()} DA</div>
                                            <div className="text-[10px] text-admin-secondary font-mono-tech">{p.purchase_price.toLocaleString()} DA</div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className={`text-[11px] font-bold ${margin > 30 ? 'text-emerald-600' : margin > 15 ? 'text-admin-primary' : 'text-amber-600'}`}>{margin}%</div>
                                            <div className="w-16 h-1 bg-admin-bg rounded-full overflow-hidden mx-auto mt-1.5">
                                                <div className={`h-full ${margin > 30 ? 'bg-emerald-500' : 'bg-admin-btn'}`} style={{ width: `${Math.min(100, margin)}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-mono-tech font-bold ${p.quantity <= p.low_stock_threshold ? 'text-rose-500' : 'text-admin-primary'}`}>
                                                    {p.quantity}
                                                </span>
                                                {p.quantity <= p.low_stock_threshold && <Zap className="w-3 h-3 text-rose-500 animate-pulse" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-admin-border'}`} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-admin-primary">{p.is_active ? 'Active' : 'Masqué'}</span>
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest ${rotation === 'high' ? 'text-emerald-600' : rotation === 'medium' ? 'text-admin-secondary' : rotation === 'slow' ? 'text-amber-600' : 'text-rose-600'
                                                    }`}>{rotation} rotation</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => handleUpdate(p.id, 'is_active', !p.is_active)}
                                                    className="text-[9px] font-bold text-admin-secondary hover:text-admin-primary px-3 py-1.5 rounded-lg border border-admin-border bg-admin-card hover:bg-admin-bg transition-all">
                                                    {p.is_active ? 'Masquer' : 'Activer'}
                                                </button>
                                                <button onClick={() => handleDelete(p.id)}
                                                    className="text-[9px] font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all">
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
                <div className="p-5 border-t border-admin-border bg-admin-bg/30 text-center">
                    <span className="text-[10px] text-admin-secondary font-mono-tech font-medium">{filtered.length} produit(s) affichés sur {products.length} total</span>
                </div>
            </div>
        </motion.div>
    );
}
