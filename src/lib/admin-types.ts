// ============================================================
// Admin Panel Type Definitions
// ============================================================

export type ProductType = 'phone' | 'accessory' | 'spare_part';
export type RotationType = 'high' | 'medium' | 'slow' | 'dead';
export type RepairStatus = 'received' | 'diagnosing' | 'waiting_parts' | 'repairing' | 'ready' | 'delivered' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CustomerSegment = 'vip' | 'regular' | 'inactive';
export type FinanceType = 'revenue' | 'expense' | 'purchase' | 'payroll' | 'other';
export type StockMovementType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'repair_use' | 'initial';
export type AuditAction = 'create' | 'update' | 'delete' | 'status_change' | 'login' | 'export';
export type PromotionType = 'discount_percent' | 'discount_fixed' | 'coupon' | 'bundle' | 'flash_sale';
export type POStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled';

// ============================================================
// Products
// ============================================================
export interface Product {
    id: string;
    name: string;
    sku: string;
    brand: string;
    category_id?: string;
    category?: string;
    type?: ProductType;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
    is_featured: boolean;
    image_url?: string;
    images?: string[];
    description?: string;
    color?: string;
    storage_capacity?: string;
    warranty_months?: number;
    compatible_models?: string[];
    supplier?: string;
    added_at?: string;
    updated_at?: string;
    // Enhanced fields
    sub_category?: string;
    rotation_indicator?: RotationType;
    last_sold_at?: string;
    imei_list?: string[];
    imei?: string;
    imei_required?: boolean;
    variants?: ProductVariant[];
    average_cost?: number;
    reorder_threshold?: number;
    avg_daily_sales?: number;
    days_to_depletion?: number;
    barcode?: string;
}

export interface ProductVariant {
    color: string;
    storage?: string;
    quantity: number;
    sku_suffix?: string;
}

// ============================================================
// Sales & Orders
// ============================================================
export interface Sale {
    id: string;
    order_number: string;
    date: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    customer_id?: string;
    items: SaleItem[];
    total_amount: number;
    discount_amount: number;
    payment_method: string;
    status: OrderStatus;
    is_pos_sale: boolean;
    pos_reference?: string;
    return_reason?: string;
    notes?: string;
}

export interface SaleItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    imei_id?: string;
}

export interface OrderStatusLog {
    id: string;
    order_id: string;
    old_status: string | null;
    new_status: string;
    changed_by?: string;
    note?: string;
    created_at: string;
}

// ============================================================
// Repairs
// ============================================================
export interface Repair {
    id: string;
    tracking_id?: string;
    customer_name: string;
    customer_phone: string;
    customer_id?: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    imei?: string;
    issue_description: string;
    status: RepairStatus;
    estimated_cost?: number;
    final_cost?: number;
    cost_actual?: number;
    technician_notes?: string;
    parts_used?: RepairPart[];
    signature_url?: string;
    created_at: string;
    updated_at: string;
}

export interface RepairPart {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_cost: number;
}

// ============================================================
// Inventory
// ============================================================
export interface InventorySnapshot {
    id: string;
    total_capital: number;
    total_items: number;
    distribution: Record<string, { capital: number; quantity: number }>;
    created_at: string;
}

export interface StockMovement {
    id: string;
    product_id: string;
    change: number;
    type: StockMovementType;
    reference_id?: string;
    user_id?: string;
    note?: string;
    created_at: string;
    // Joined
    product_name?: string;
}

// ============================================================
// Suppliers & Purchasing
// ============================================================
export interface Supplier {
    id: string;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    payment_terms?: string;
    rating?: number;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PurchaseOrder {
    id: string;
    po_number: string;
    supplier_id: string;
    status: POStatus;
    total_amount: number;
    notes?: string;
    expected_delivery?: string;
    received_at?: string;
    created_at: string;
    updated_at: string;
    // Joined
    supplier_name?: string;
    items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: string;
    po_id: string;
    product_id: string;
    quantity: number;
    unit_cost: number;
    received_quantity: number;
    created_at: string;
    // Joined
    product_name?: string;
}

// ============================================================
// Customers
// ============================================================
export interface Customer {
    id: string;
    user_id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    segment: CustomerSegment;
    loyalty_points: number;
    total_spent: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================
// Finance
// ============================================================
export interface FinanceEntry {
    id: string;
    type: FinanceType;
    category?: string;
    amount: number;
    description?: string;
    reference_id?: string;
    reference_type?: string;
    date: string;
    created_at: string;
}

export interface FinancialReport {
    total_sales: number;
    total_expenses: number;
    total_profit: number;
    top_products: { name: string; revenue: number }[];
    sales_over_time: { date: string; amount: number }[];
    expenses_by_category: { category: string; amount: number }[];
}

// ============================================================
// Audit & AI Logs
// ============================================================
export interface AuditLog {
    id: string;
    user_id?: string;
    action: AuditAction;
    entity: string;
    entity_id?: string;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    ip_address?: string;
    created_at: string;
}

export interface AILog {
    id: string;
    feature: string;
    input_hash?: string;
    input_snapshot?: Record<string, unknown>;
    output_summary?: string;
    confidence?: number;
    tokens_used?: number;
    created_at: string;
}

// ============================================================
// Promotions
// ============================================================
export interface Promotion {
    id: string;
    name: string;
    type: PromotionType;
    value: number;
    coupon_code?: string;
    applicable_products?: string[];
    applicable_categories?: string[];
    min_purchase?: number;
    max_uses?: number;
    current_uses?: number;
    starts_at: string;
    ends_at?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================================
// Dashboard
// ============================================================
export interface DashboardMetrics {
    today_sales: number;
    daily_net_profit: number;
    orders_count: number;
    avg_invoice_value: number;
    low_stock_count: number;
    slow_moving_count: number;
    devices_in_repair: number;
}

export interface AIRecommendation {
    type: 'restock' | 'price_reduction' | 'slow_mover_alert';
    title: string;
    description: string;
    action_label: string;
    confidence: number;
    data?: Record<string, unknown>;
}

// ============================================================
// Accessory Batches (existing)
// ============================================================
export interface AccessoryBatch {
    id: string;
    product_id: string;
    purchase_price: number;
    quantity: number;
    added_at: string;
    supplier?: string;
}
