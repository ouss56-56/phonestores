interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const statusColors: Record<string, string> = {
    // Orders
    pending: 'bg-amber-500/10 text-amber-500',
    confirmed: 'bg-blue-500/10 text-blue-500',
    processing: 'bg-indigo-500/10 text-indigo-500',
    shipped: 'bg-violet-500/10 text-violet-500',
    delivered: 'bg-emerald-500/10 text-emerald-500',
    cancelled: 'bg-red-500/10 text-red-400',
    completed: 'bg-emerald-500/10 text-emerald-500',
    // Repairs
    received: 'bg-blue-500/10 text-blue-500',
    diagnosing: 'bg-amber-500/10 text-amber-500',
    waiting_parts: 'bg-orange-500/10 text-orange-400',
    repairing: 'bg-indigo-500/10 text-indigo-500',
    ready: 'bg-emerald-500/10 text-emerald-500',
    // PO
    draft: 'bg-white/5 text-muted-foreground',
    submitted: 'bg-blue-500/10 text-blue-500',
    // Inventory
    in_stock: 'bg-emerald-500/10 text-emerald-500',
    sold: 'bg-white/5 text-muted-foreground',
    reserved: 'bg-amber-500/10 text-amber-500',
    defective: 'bg-red-500/10 text-red-400',
    returned: 'bg-orange-500/10 text-orange-400',
    // Rotation
    high: 'bg-emerald-500/10 text-emerald-500',
    medium: 'bg-white/10 text-white/70',
    slow: 'bg-amber-500/10 text-amber-500',
    dead: 'bg-red-500/10 text-red-400',
    // Customer segments
    vip: 'bg-amber-500/10 text-amber-500',
    regular: 'bg-white/10 text-white/70',
    inactive: 'bg-white/5 text-muted-foreground',
    // Generic
    active: 'bg-emerald-500/10 text-emerald-500',
    inactive_: 'bg-white/5 text-muted-foreground',
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
    const colorClass = statusColors[status] || 'bg-white/5 text-muted-foreground';
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
