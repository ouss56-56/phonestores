import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Database, DollarSign, TrendingUp, Package, Zap, ShoppingBag, Wrench, ArrowUpRight } from "lucide-react";
import { StatCard } from "./shared/StatCard";
import { ExportButtons } from "./shared/ExportButtons";
import { dashboardService } from "@/services/admin/dashboardService";
import { aiService } from "@/services/admin/aiService";
import { exportService } from "@/services/admin/exportService";
import type { DashboardMetrics, AIRecommendation } from "@/lib/admin-types";

export function DashboardModule() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [chartData, setChartData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
    const [capitalDist, setCapitalDist] = useState<{ name: string; value: number }[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [m, chart, cap, recs] = await Promise.all([
                    dashboardService.getMetrics(),
                    dashboardService.getSalesChart(30),
                    dashboardService.getCapitalDistribution(),
                    aiService.getRecommendations(),
                ]);
                setMetrics(m);
                setChartData(chart);
                setCapitalDist(cap);
                setRecommendations(recs);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, []);

    const handleExportCSV = () => {
        if (!metrics) return;
        const csv = [
            'Metric,Value',
            `Today Sales,${metrics.today_sales}`,
            `Daily Net Profit,${metrics.daily_net_profit}`,
            `Orders Count,${metrics.orders_count}`,
            `Avg Invoice,${metrics.avg_invoice_value}`,
            `Low Stock,${metrics.low_stock_count}`,
            `Slow Moving,${metrics.slow_moving_count}`,
            `Devices in Repair,${metrics.devices_in_repair}`,
        ].join('\n');
        exportService.downloadCSV(csv, `dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportPDF = () => {
        if (!metrics) return;
        exportService.generateReportPDF('Rapport Tableau de Bord', [
            {
                heading: 'Métriques du Jour',
                rows: [
                    [`Ventes: ${metrics.today_sales.toLocaleString()} DA`, `Profit: ${metrics.daily_net_profit.toLocaleString()} DA`],
                    [`Commandes: ${metrics.orders_count}`, `Facture moy.: ${metrics.avg_invoice_value.toLocaleString()} DA`],
                    [`Stock critique: ${metrics.low_stock_count}`, `Rotation lente: ${metrics.slow_moving_count}`],
                ]
            }
        ]);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-admin-border border-t-admin-btn rounded-full animate-spin" /></div>;
    }

    const m = metrics || { today_sales: 0, daily_net_profit: 0, orders_count: 0, avg_invoice_value: 0, low_stock_count: 0, slow_moving_count: 0, devices_in_repair: 0 };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center">
                <div />
                <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <StatCard title="Ventes du Jour" value={`${m.today_sales.toLocaleString()} DA`} icon={DollarSign} delay={0} />
                <StatCard title="Profit Net" value={`${m.daily_net_profit.toLocaleString()} DA`} icon={TrendingUp} delay={0.05} />
                <StatCard title="Commandes" value={m.orders_count} icon={ShoppingBag} delay={0.1} />
                <StatCard title="Facture Moy." value={`${m.avg_invoice_value.toLocaleString()} DA`} icon={DollarSign} delay={0.15} />
                <StatCard title="Stock Critique" value={m.low_stock_count} icon={Zap} delay={0.2} />
                <StatCard title="Rotation Lente" value={m.slow_moving_count} icon={Package} delay={0.25} />
                <StatCard title="En Réparation" value={m.devices_in_repair} icon={Wrench} delay={0.3} />
            </div>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-admin-card border border-admin-border p-4 rounded-2xl flex items-center justify-between gap-6 overflow-hidden relative shadow-sm">
                <div className="flex items-center gap-2 text-admin-primary whitespace-nowrap">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-medium uppercase tracking-widest">AI Insights</span>
                </div>
                <div className="flex-1 flex gap-8 items-center overflow-x-auto no-scrollbar">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-1 h-1 rounded-full bg-admin-border" />
                            <span className="text-[11px] text-admin-secondary font-medium">{rec.description}</span>
                        </div>
                    ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-admin-bg to-transparent pointer-events-none" />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 rounded-[2rem] p-8 border border-admin-border bg-admin-card shadow-sm">
                    <h3 className="text-xl font-heading font-light text-admin-title uppercase tracking-widest mb-8">Ventes (30 jours)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#737373', opacity: 0.8, fontSize: 10 }}
                                    tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', opacity: 0.8, fontSize: 10 }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #EDEDED', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#111111" fill="rgba(17,17,17,0.02)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="rounded-[2rem] p-8 border border-admin-border space-y-6 bg-admin-card shadow-sm">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-admin-title" />
                        <h3 className="text-xl font-heading font-light text-admin-title uppercase tracking-widest">Lumina AI</h3>
                    </div>
                    <div className="space-y-4">
                        {recommendations.map((rec, i) => {
                            const color = rec.type === 'restock' ? 'amber' : rec.type === 'price_reduction' ? 'emerald' : 'blue';
                            const colors: Record<string, string> = {
                                amber: "bg-amber-50 border-amber-200 text-amber-600",
                                emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
                                blue: "bg-blue-50 border-blue-200 text-blue-600"
                            };
                            const c = colors[color];
                            return (
                                <div key={i} className={`${c.split(' ').slice(0, 2).join(' ')} border p-5 rounded-3xl group cursor-pointer hover:shadow-soft transition-all`}>
                                    <div className={`text-[10px] font-bold ${c.split(' ')[2]} uppercase mb-1 tracking-widest`}>{rec.title}</div>
                                    <p className="text-[11px] text-admin-secondary leading-relaxed mb-3">{rec.description}</p>
                                    <button className={`text-[10px] font-bold ${c.split(' ')[2]} uppercase flex items-center gap-1 group-hover:gap-2 transition-all`}>
                                        {rec.action_label} <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Capital Distribution */}
            {capitalDist.length > 0 && (
                <div className="rounded-[2rem] p-8 border border-admin-border bg-admin-card shadow-sm">
                    <h3 className="text-xl font-heading font-light text-admin-title uppercase tracking-widest mb-8">Répartition du Capital</h3>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={capitalDist}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373', opacity: 0.8, fontSize: 10, fontWeight: 500 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', opacity: 0.8, fontSize: 10 }}
                                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ background: '#FFFFFF', border: '1px solid #EDEDED', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }} />
                                <Bar dataKey="value" fill="#111111" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
