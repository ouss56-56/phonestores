interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusColors: Record<string, string> = {
    // Orders
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border border-blue-200',
    processing: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    shipped: 'bg-violet-100 text-violet-700 border border-violet-200',
    delivered: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border border-rose-200',
    completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    // Repairs
    received: 'bg-blue-100 text-blue-700 border border-blue-200',
    diagnosing: 'bg-amber-100 text-amber-700 border border-amber-200',
    waiting_parts: 'bg-orange-100 text-orange-700 border border-orange-200',
    repairing: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    ready: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    // PO
    draft: 'bg-slate-100 text-slate-600 border border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border border-blue-200',
    // Inventory
    in_stock: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    sold: 'bg-slate-100 text-slate-600 border border-slate-200',
    reserved: 'bg-amber-100 text-amber-700 border border-amber-200',
    defective: 'bg-rose-100 text-rose-700 border border-rose-200',
    returned: 'bg-orange-100 text-orange-700 border border-orange-200',
    // Rotation
    high: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    medium: 'bg-slate-100 text-slate-700 border border-slate-200',
    slow: 'bg-amber-100 text-amber-700 border border-amber-200',
    dead: 'bg-rose-100 text-rose-700 border border-rose-200',
    // Customer segments
    vip: 'bg-amber-100 text-amber-700 border border-amber-200',
    regular: 'bg-slate-100 text-slate-700 border border-slate-200',
    inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
    // Generic
    active: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    inactive_: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    completed: 'Terminée',
    received: 'Reçu',
    diagnosing: 'Diagnostic',
    waiting_parts: 'Attente pièces',
    repairing: 'Réparation',
    ready: 'Prêt',
    draft: 'Brouillon',
    submitted: 'Soumis',
    in_stock: 'En stock',
    sold: 'Vendu',
    reserved: 'Réservé',
    defective: 'Défectueux',
    returned: 'Retourné',
    high: 'Rapide',
    medium: 'Modérée',
    slow: 'Lente',
    dead: 'Mort',
    vip: 'VIP',
    regular: 'Régulier',
    inactive: 'Inactif',
    active: 'Actif',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const colorClass = statusColors[status] || 'bg-slate-100 text-slate-600 border border-slate-200';
    const label = statusLabels[status] || status;
    const sizeClass = size === 'sm'
        ? 'text-[9px] px-2 py-0.5'
        : 'text-[10px] px-3 py-1';

    return (
        <span className={`${colorClass} ${sizeClass} rounded-full font-bold uppercase tracking-widest inline-block`}>
            {label}
        </span>
    );
}
