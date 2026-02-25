import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Database, DollarSign, TrendingUp, Package, Zap, ShoppingBag, Wrench, ArrowUpRight, Calendar, PieChart as PieIcon } from "lucide-react";
import { StatCard } from "./shared/StatCard";
import { ExportButtons } from "./shared/ExportButtons";
import { dashboardService } from "@/services/admin/dashboardService";
import { aiService } from "@/services/admin/aiService";
import { exportService } from "@/services/admin/exportService";
import type { DashboardMetrics, AIRecommendation } from "@/lib/admin-types";

const COLORS = ['#111111', '#404040', '#737373', '#A3A3A3', '#D4D4D4'];

export function DashboardModule() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [chartData, setChartData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
    const [categoryPerf, setCategoryPerf] = useState<{ name: string; revenue: number }[]>([]);
    const [capitalDist, setCapitalDist] = useState<{ name: string; value: number }[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [chartRange, setChartRange] = useState<'30d' | '1y'>('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [m, chart30, yearly, cap, recs, catPerf] = await Promise.all([
                    dashboardService.getMetrics(),
                    dashboardService.getSalesChart(30),
                    dashboardService.getYearlySalesChart(),
                    dashboardService.getCapitalDistribution(),
                    aiService.getRecommendations(),
                    dashboardService.getCategoryPerformance(),
                ]);
                setMetrics(m);
                setChartData(chartRange === '30d' ? chart30 : yearly);
                setCapitalDist(cap);
                setRecommendations(recs);
                setCategoryPerf(catPerf);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, [chartRange]);

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
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-heading font-light text-admin-title uppercase tracking-widest">
                            {chartRange === '30d' ? 'Ventes (30 jours)' : 'Ventes (Annuel)'}
                        </h3>
                        <div className="flex bg-admin-bg/50 p-1 rounded-xl border border-admin-border/50">
                            <button
                                onClick={() => setChartRange('30d')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${chartRange === '30d' ? 'bg-white shadow-sm text-admin-primary' : 'text-admin-secondary hover:text-admin-primary'}`}
                            >
                                30 Jours
                            </button>
                            <button
                                onClick={() => setChartRange('1y')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${chartRange === '1y' ? 'bg-white shadow-sm text-admin-primary' : 'text-admin-secondary hover:text-admin-primary'}`}
                            >
                                Année
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#737373', opacity: 0.8, fontSize: 10 }}
                                    tickFormatter={(v) => chartRange === '30d' ? v.split('-').slice(1).join('/') : v} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', opacity: 0.8, fontSize: 10 }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #EDEDED', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#111111" fill="rgba(17,17,17,0.02)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Performance Pie */}
                <div className="rounded-[2rem] p-8 border border-admin-border bg-admin-card shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <PieIcon className="w-5 h-5 text-admin-title" />
                        <h3 className="text-xl font-heading font-light text-admin-title uppercase tracking-widest">Par Catégorie</h3>
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryPerf}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="revenue"
                                    stroke="none"
                                >
                                    {categoryPerf.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `${value.toLocaleString()} DA`}
                                    contentStyle={{ background: '#FFFFFF', border: '1px solid #EDEDED', borderRadius: '16px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {categoryPerf.slice(0, 4).map((entry, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[11px] text-admin-secondary">{entry.name}</span>
                                </div>
                                <span className="text-[11px] font-bold text-admin-title">{Math.round((entry.revenue / categoryPerf.reduce((a, b) => a + b.revenue, 0)) * 100)}%</span>
                            </div>
                        ))}
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
