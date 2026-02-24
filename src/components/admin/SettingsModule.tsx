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
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-admin-btn text-white shadow-lg shadow-black/10 scale-[1.02]' : 'bg-admin-card border border-admin-border text-admin-primary hover:bg-admin-bg shadow-sm'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <div className="bg-admin-card p-10 border border-admin-border rounded-[2.5rem] h-full space-y-10 shadow-sm">
                    {activeTab === 'general' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-admin-title italic uppercase tracking-tighter">Paramètres Généraux</h3>
                                    <p className="text-[10px] text-admin-secondary mt-1 uppercase tracking-widest font-bold">Configuration de base de la boutique</p>
                                </div>
                                <button onClick={() => toast.success("Configuration enregistrée")} className="bg-admin-btn text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-black/10">
                                    <Save className="w-4 h-4" /> Enregistrer
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Nom du Magasin</label>
                                    <input type="text" defaultValue="LUMINA PHONE STORE" className="w-full bg-admin-bg border border-admin-border rounded-2xl p-4 text-sm text-admin-primary focus:border-admin-btn/40 outline-none transition-all font-bold placeholder:font-normal" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Devise Par Défaut</label>
                                    <select className="w-full bg-admin-bg border border-admin-border rounded-2xl p-4 text-sm text-admin-primary focus:border-admin-btn/40 outline-none transition-all font-bold uppercase tracking-widest">
                                        <option value="DZD">Dinar Algérien (DA)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">Dollar ($)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Langue de l'Interface</label>
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-admin-btn text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10">Français</button>
                                        <button className="flex-1 bg-admin-bg border border-admin-border text-admin-secondary py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">العربية (Coming Soon)</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-admin-secondary uppercase font-bold tracking-widest ml-1">Heure Locale</label>
                                    <input type="text" readOnly value="UTC+1 (Algiers)" className="w-full bg-admin-bg border border-admin-border rounded-2xl p-4 text-sm text-admin-secondary font-bold" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div>
                                <h3 className="text-2xl font-bold text-admin-title italic uppercase tracking-tighter">Sécurité & Accès</h3>
                                <p className="text-[10px] text-admin-secondary mt-1 uppercase tracking-widest font-bold">Gérer les accès au panneau d'administration</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 bg-admin-bg border border-admin-border rounded-[2rem] flex items-center justify-between shadow-sm hover:border-admin-secondary/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl text-admin-btn shadow-sm"><Lock className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-admin-title uppercase tracking-tight">Authentification à deux facteurs</p>
                                            <p className="text-[10px] text-admin-secondary uppercase tracking-widest font-bold mt-1">Non activé</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-admin-btn px-6 py-2.5 rounded-xl border border-admin-btn/20 hover:bg-admin-btn hover:text-white transition-all">Activer</button>
                                </div>

                                <div className="p-8 bg-admin-bg border border-admin-border rounded-[2rem] flex items-center justify-between shadow-sm hover:border-admin-secondary/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-admin-card border border-admin-border rounded-2xl text-rose-500 shadow-sm"><Shield className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-admin-title uppercase tracking-tight">Changer le mot de passe Admin</p>
                                            <p className="text-[10px] text-admin-secondary uppercase tracking-widest font-bold mt-1">Dernière modification : il y a 3 mois</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-admin-secondary hover:text-admin-title transition-colors">Modifier →</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ai' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div>
                                <h3 className="text-2xl font-bold text-admin-title italic uppercase tracking-tighter">Intelligence Artificielle</h3>
                                <p className="text-[10px] text-admin-secondary mt-1 uppercase tracking-widest font-bold">Configuration du moteur Lumina AI</p>
                            </div>

                            <div className="p-10 bg-admin-bg border border-admin-btn/10 rounded-[2.5rem] space-y-8 shadow-sm">
                                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-admin-border">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-admin-btn/5 rounded-xl"><Cpu className="w-6 h-6 text-admin-btn" /></div>
                                        <span className="text-sm font-bold text-admin-title uppercase tracking-widest italic">Moteur OpenAI (GPT-4)</span>
                                    </div>
                                    <div className="w-14 h-7 bg-emerald-500 rounded-full relative p-1 cursor-pointer shadow-inner">
                                        <div className="w-5 h-5 bg-white rounded-full absolute right-1 shadow-md" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] text-admin-secondary uppercase font-bold tracking-[0.3em] ml-1">API Key Status</label>
                                    <div className="flex items-center gap-4 bg-admin-card p-5 rounded-2xl border border-admin-border shadow-inner">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-xs text-admin-secondary font-mono-tech font-bold tracking-widest">sk-proj-••••••••••••••••••••••••••••••••••••••••••••••••</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['display', 'notifications', 'data'].includes(activeTab) && (
                        <div className="h-full flex flex-col items-center justify-center text-admin-secondary italic text-[10px] uppercase tracking-[0.5em] opacity-30 font-bold gap-4">
                            <div className="w-12 h-1 bg-admin-border rounded-full" />
                            Module en cours de développement
                            <div className="w-12 h-1 bg-admin-border rounded-full" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
