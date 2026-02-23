import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Bell, Shield, Database, Cpu, Save, Lock, Smartphone } from "lucide-react";
import { toast } from "sonner";

export function SettingsModule() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Général', icon: Settings },
        { id: 'display', label: 'Affichage', icon: Smartphone },
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'ai', label: 'Intelligence Artificielle', icon: Cpu },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'data', label: 'Données', icon: Database },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 space-y-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-105' : 'glass border border-white/5 text-white hover:bg-white/5'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <div className="glass-card p-10 border-white/5 h-full space-y-10">
                    {activeTab === 'general' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-white italic">Paramètres Généraux</h3>
                                    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Configuration de base de la boutique</p>
                                </div>
                                <button onClick={() => toast.success("Configuration enregistrée")} className="bg-primary text-background px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                    <Save className="w-3.5 h-3.5" /> Enregistrer
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Nom du Magasin</label>
                                    <input type="text" defaultValue="LUMINA PHONE STORE" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Devise Par Défaut</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all">
                                        <option value="DZD">Dinar Algérien (DA)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">Dollar ($)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Langue de l'Interface</label>
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-primary/10 border border-primary/30 text-primary py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Français</button>
                                        <button className="flex-1 bg-white/5 border border-white/10 text-muted-foreground py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest">العربية (Coming Soon)</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Heure Locale</label>
                                    <input type="text" readOnly value="UTC+1 (Algiers)" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-muted-foreground" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white italic">Sécurité & Accès</h3>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Gérer les accès au panneau d'administration</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Lock className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Authentification à deux facteurs</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Non activé</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Activer</button>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500"><Shield className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Changer le mot de passe Admin</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Dernière modification : il y a 3 mois</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Modifier</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ai' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white italic">Intelligence Artificielle</h3>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Configuration du moteur Lumina AI</p>
                            </div>

                            <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-5 h-5 text-primary" />
                                        <span className="text-sm font-bold text-white uppercase tracking-widest italic">Moteur OpenAI (GPT-4)</span>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em]">API Key Status</label>
                                    <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-white/50 font-mono-tech">sk-proj-..............................................</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['display', 'notifications', 'data'].includes(activeTab) && (
                        <div className="h-full flex items-center justify-center text-muted-foreground italic text-xs uppercase tracking-[0.5em] opacity-30">
                            Module en cours de développement
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
