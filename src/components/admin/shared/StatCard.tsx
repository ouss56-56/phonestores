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
            className="rounded-[1.5rem] p-5 border border-admin-border bg-admin-card relative overflow-hidden group hover:shadow-soft transition-all duration-500"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-admin-border bg-admin-bg">
                    <Icon className="w-4 h-4 text-admin-secondary" />
                </div>
                <span className="text-[9px] text-admin-secondary uppercase tracking-widest font-medium">{title}</span>
            </div>
            <div className="text-xl font-mono-tech font-bold text-admin-title tracking-tight">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </motion.span>
            </div>
            {trend && (
                <div className={`text-[10px] font-bold mt-2 ${trend.value >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
                </div>
            )}
        </motion.div>
    );
}
