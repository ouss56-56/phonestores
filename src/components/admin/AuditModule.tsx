import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Filter, Clock, User, HardDrive, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { auditService } from "@/services/admin/auditService";
import { StatCard } from "./shared/StatCard";
import type { AuditLog } from "@/lib/admin-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AuditModule() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const loadData = async () => {
        try {
            const data = await auditService.getLogs();
            setLogs(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const filtered = logs.filter(l =>
        l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.user_id?.toLowerCase().includes(search.toLowerCase())
    );

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'delete': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default: return <HardDrive className="w-4 h-4 text-primary" />;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Événements" value={logs.length} icon={Shield} delay={0} />
                <StatCard title="Dernières 24h" value={logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 86400000)).length} icon={Clock} delay={0.1} />
                <StatCard title="Entités Affectées" value={new Set(logs.map(l => l.entity_type)).size} icon={HardDrive} delay={0.2} />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Timeline view */}
                <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Filtrer par entité, action ou utilisateur..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-primary/50 transition-all font-bold placeholder:font-normal"
                            />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] border-white/5 border overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {filtered.map((log, idx) => (
                                <div
                                    key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    className={`p-6 border-b border-white/5 cursor-pointer transition-all flex items-center gap-6 ${selectedLog?.id === log.id ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}`}
                                >
                                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10`}>
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-white uppercase tracking-widest italic">
                                                {log.action} <span className="text-primary mx-2">→</span> {log.entity_type}
                                            </h4>
                                            <span className="text-[10px] font-mono-tech text-muted-foreground">
                                                {format(new Date(log.created_at), 'HH:mm:ss', { locale: fr })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user_id || 'System'}</span>
                                            <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> ID: {log.entity_id?.split('-')[0]}...</span>
                                        </div>
                                    </div>
                                    <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedLog?.id === log.id ? 'translate-x-1 text-primary' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Diff Viewer Sidebar */}
                <div className="w-full lg:w-[450px]">
                    <AnimatePresence mode="wait">
                        {selectedLog ? (
                            <motion.div
                                key={selectedLog.id}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="glass-card p-8 border-white/5 sticky top-8 space-y-8"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Détails de l'Action</p>
                                    <h3 className="text-2xl font-bold text-white italic">{selectedLog.entity_type}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(selectedLog.created_at), "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {selectedLog.old_values && (
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Valeurs Précédentes</p>
                                            <pre className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-[11px] font-mono-tech text-rose-200/70 overflow-x-auto">
                                                {JSON.stringify(selectedLog.old_values, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {selectedLog.new_values && (
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nouvelles Valeurs</p>
                                            <pre className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-[11px] font-mono-tech text-emerald-200/70 overflow-x-auto">
                                                {JSON.stringify(selectedLog.new_values, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Adresse IP</p>
                                        <p className="text-[10px] font-mono-tech text-white">{selectedLog.ip_address || '0.0.0.0'}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-2xl">
                                        <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mb-1">User Agent</p>
                                        <p className="text-[10px] font-mono-tech text-white truncate" title={selectedLog.user_agent || ''}>{selectedLog.user_agent?.split(' ')[0] || 'Unknown'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-64 border border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center text-muted-foreground italic text-xs uppercase tracking-widest text-center px-10">
                                Sélectionnez un événement pour visualiser les modifications (Diff)
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
