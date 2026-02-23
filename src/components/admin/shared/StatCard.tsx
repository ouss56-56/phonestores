import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    accent?: string;
    trend?: { value: number; label: string };
    delay?: number;
}

export function StatCard({ title, value, icon: Icon, accent, trend, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card rounded-3xl p-5 border-black/5 bg-white relative overflow-hidden group hover:shadow-sm transition-all duration-500"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-black/5 bg-black/5">
                    <Icon className="w-4 h-4 text-black/40" />
                </div>
                <span className="text-[9px] text-black/40 uppercase tracking-widest font-medium">{title}</span>
            </div>
            <div className="text-xl font-mono-tech font-bold text-[#111111] tracking-tight">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </motion.span>
            </div>
            {trend && (
                <div className={`text-[10px] font-bold mt-2 ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
                </div>
            )}
        </motion.div>
    );
}
