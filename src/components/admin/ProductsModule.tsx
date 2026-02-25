import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, Download, Zap, Tag, MoreVertical, Trash2, AlertCircle } from "lucide-react";
import { productsService } from "@/services/admin/productsService";
import { categoryService, type Category } from "@/services/admin/categoryService";
import { exportService } from "@/services/admin/exportService";
import { SearchBar } from "./shared/SearchBar";
import type { Product } from "@/lib/admin-types";
import { toast } from "sonner";
import { productFormSchema, validate } from "@/lib/validation";

export function ProductsModule() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '', brand: '', category_id: '', type: 'phone', purchase_price: 0, selling_price: 0,
        quantity: 0, low_stock_threshold: 5, is_active: true, is_featured: false,
    });

    const loadData = async () => {
        try {
            const [prodData, catData] = await Promise.all([
                productsService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(prodData);
            setCategories(catData);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCreate = async () => {
        setFieldErrors({});

        // 1. Zod Validation
        const validation = validate(productFormSchema, newProduct);
        if (!validation.success) {
            setFieldErrors(validation.errors || {});
            toast.error("Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        try {
            await productsService.create(validation.data!);
            toast.success("Produit créé");
            setShowAddForm(false);
            setNewProduct({ name: '', brand: '', category_id: '', type: 'phone', purchase_price: 0, selling_price: 0, quantity: 0, low_stock_threshold: 5, is_active: true, is_featured: false });
            loadData();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleUpdate = async (id: string, field: string, value: any) => {
        try {
            await productsService.update(id, { [field]: value });
            toast.success("Mis à jour");
            loadData();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce produit ?")) return;
        try {
            await productsService.deleteProduct(id);
            toast.success("Supprimé");
            loadData();
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
        loadData();
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
                    <SearchBar value={search} onChange={setSearch} placeholder="Filtrer par nom, SKU, marque ou catégorie..." />
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
                    <h3 className="text-lg font-bold text-admin-title uppercase tracking-widest italic flex items-center gap-3">
                        <Plus className="w-5 h-5 text-admin-btn" /> Nouveau Produit
                    </h3>
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
                        ].map(({ label, key, type }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest px-1">{label}</label>
                                <input type={type}
                                    value={newProduct[key as keyof Product] as string || ''}
                                    onChange={(e) => {
                                        setNewProduct({ ...newProduct, [key]: type === 'number' ? Number(e.target.value) : e.target.value });
                                        if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
                                    }}
                                    className={`w-full bg-admin-bg border rounded-xl py-3 px-4 text-sm text-admin-primary outline-none transition-all shadow-sm ${fieldErrors[key] ? 'border-destructive' : 'border-admin-border focus:border-admin-secondary/40'}`} />
                                {fieldErrors[key] && <p className="text-[9px] text-destructive flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {fieldErrors[key]}</p>}
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest px-1">Catégorie</label>
                            <select value={newProduct.category_id || ''}
                                onChange={(e) => {
                                    setNewProduct({ ...newProduct, category_id: e.target.value });
                                    if (fieldErrors.category_id) setFieldErrors(prev => { const n = { ...prev }; delete n.category_id; return n; });
                                }}
                                className={`w-full bg-admin-bg border rounded-xl py-3 px-4 text-sm text-admin-primary outline-none transition-all shadow-sm ${fieldErrors.category_id ? 'border-destructive' : 'border-admin-border focus:border-admin-secondary/40'}`}>
                                <option value="">-- Sélectionner --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {fieldErrors.category_id && <p className="text-[9px] text-destructive flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {fieldErrors.category_id}</p>}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleCreate}
                            className="bg-admin-btn text-white px-10 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10">Créer le produit</button>
                        <button onClick={() => setShowAddForm(false)}
                            className="bg-admin-card border border-admin-border px-10 py-3.5 rounded-xl text-[10px] font-bold text-admin-primary uppercase tracking-widest hover:bg-admin-bg transition-all">Annuler</button>
                    </div>
                </motion.div>
            )}

            {/* Products Table */}
            <div className="bg-admin-card rounded-[2.5rem] overflow-hidden border border-admin-border shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-admin-bg/50 border-b border-admin-border">
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Produit</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">SKU / Code-barres</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Prix</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest text-center">Marge</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Stock</th>
                                <th className="text-left px-8 py-6 text-[10px] font-bold text-admin-secondary uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filtered.map((p, i) => {
                                const margin = productsService.calculateMargin(p.purchase_price, p.selling_price);
                                const rotation = productsService.detectRotation(p);
                                const categoryName = categories.find(c => c.id === p.category_id)?.name || p.category || '—';

                                return (
                                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.01 }}
                                        className="hover:bg-admin-bg/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-admin-bg flex items-center justify-center text-sm font-bold text-admin-primary border border-admin-border shadow-sm group-hover:scale-110 transition-transform">
                                                    {p.brand[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-admin-title">{p.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-admin-secondary uppercase tracking-widest font-bold">{p.brand}</span>
                                                        <div className="w-1 h-1 rounded-full bg-admin-border" />
                                                        <div className="flex items-center gap-1 text-[10px] text-admin-btn font-bold uppercase tracking-widest">
                                                            <Tag className="w-3 h-3" /> {categoryName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-[11px] font-mono-tech text-admin-primary font-bold">{p.sku}</div>
                                            <div className="text-[10px] text-admin-secondary font-mono-tech mt-1">{p.barcode || '—'}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-bold text-admin-title font-mono-tech">{p.selling_price.toLocaleString()} DA</div>
                                            <div className="text-[10px] text-admin-secondary font-mono-tech mt-1">{p.purchase_price.toLocaleString()} DA</div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className={`text-[11px] font-bold ${margin > 30 ? 'text-emerald-600' : margin > 15 ? 'text-admin-primary' : 'text-amber-600'}`}>{margin}%</div>
                                            <div className="w-16 h-1 bg-admin-bg rounded-full overflow-hidden mx-auto mt-2">
                                                <div className={`h-full ${margin > 30 ? 'bg-emerald-500' : 'bg-admin-btn'}`} style={{ width: `${Math.min(100, margin)}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-mono-tech font-bold ${p.quantity <= p.low_stock_threshold ? 'text-rose-500' : 'text-admin-primary'}`}>
                                                    {p.quantity}
                                                </span>
                                                {p.quantity <= p.low_stock_threshold && <Zap className="w-3 h-3 text-rose-500 animate-pulse" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-admin-border'}`} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-admin-primary">{p.is_active ? 'En ligne' : 'Masqué'}</span>
                                                </div>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit ${rotation === 'high' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    rotation === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>Rotation {rotation}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all justify-end">
                                                <button onClick={() => handleUpdate(p.id, 'is_active', !p.is_active)}
                                                    className="p-2 rounded-xl border border-admin-border bg-admin-card hover:bg-admin-bg transition-all shadow-sm" title={p.is_active ? 'Masquer' : 'Activer'}>
                                                    <MoreVertical className="w-4 h-4 text-admin-secondary" />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)}
                                                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-admin-border bg-admin-bg/30 text-center">
                    <span className="text-[10px] text-admin-secondary font-mono-tech font-bold uppercase tracking-widest opacity-60">Affichage de {filtered.length} produits sur {products.length} au total</span>
                </div>
            </div>
            <CategoryManagement categories={categories} onRefresh={loadData} />
        </motion.div>
    );
}

function CategoryManagement({ categories, onRefresh }: { categories: Category[], onRefresh: () => void }) {
    const [show, setShow] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', slug: '', type: 'phone' as any });

    const handleCreate = async () => {
        if (!newCat.name || !newCat.slug) {
            toast.error("Nom et slug requis");
            return;
        }
        try {
            await categoryService.create(newCat);
            toast.success("Catégorie créée");
            setNewCat({ name: '', slug: '', type: 'phone' });
            onRefresh();
        } catch (e: any) { toast.error(e.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette catégorie ?")) return;
        try {
            await categoryService.delete(id);
            toast.success("Catégorie supprimée");
            onRefresh();
        } catch (e: any) { toast.error(e.message); }
    };

    return (
        <div className="space-y-4">
            <button onClick={() => setShow(!show)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-admin-secondary hover:text-admin-btn transition-colors px-4">
                <Tag className="w-4 h-4" /> {show ? "Masquer la gestion des catégories" : "Gérer les catégories"}
            </button>

            {show && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-admin-card rounded-[2rem] p-8 border border-admin-border shadow-soft space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-admin-title uppercase tracking-widest italic">Gestion des Catégories</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[9px] text-admin-secondary uppercase font-bold tracking-widest px-1">Nom</label>
                            <input type="text" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-admin-bg border border-admin-border rounded-xl py-2.5 px-4 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] text-admin-secondary uppercase font-bold tracking-widest px-1">Slug</label>
                            <input type="text" value={newCat.slug} onChange={e => setNewCat({ ...newCat, slug: e.target.value })} className="w-full bg-admin-bg border border-admin-border rounded-xl py-2.5 px-4 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all shadow-sm font-mono-tech" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] text-admin-secondary uppercase font-bold tracking-widest px-1">Type</label>
                            <select value={newCat.type} onChange={e => setNewCat({ ...newCat, type: e.target.value as any })} className="w-full bg-admin-bg border border-admin-border rounded-xl py-2.5 px-4 text-sm text-admin-primary outline-none focus:border-admin-secondary/40 transition-all shadow-sm">
                                <option value="phone">Téléphone</option>
                                <option value="accessory">Accessoire</option>
                                <option value="spare_part">Pièce Détachée</option>
                            </select>
                        </div>
                        <button onClick={handleCreate} className="bg-admin-btn text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-black/10 h-[42px]">Ajouter</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between bg-admin-bg/50 border border-admin-border rounded-xl px-3 py-2 group">
                                <span className="text-[11px] font-bold text-admin-title truncate">{cat.name}</span>
                                <button onClick={() => handleDelete(cat.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-rose-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
