export type ProductType = 'phone' | 'accessory' | 'spare_part';
export type RotationType = 'high' | 'medium' | 'slow' | 'dead';
export type RepairStatus = "received" | "diagnosing" | "waiting_parts" | "repairing" | "ready" | "delivered" | "cancelled";

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
    imei_list?: string[]; // Helper for UI
    imei?: string;
}

export interface AccessoryBatch {
    id: string;
    product_id: string;
    purchase_price: number;
    quantity: number;
    added_at: string;
    supplier?: string;
}

export interface Sale {
    id: string;
    order_number: string;
    date: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    items: SaleItem[];
    total_amount: number;
    discount_amount: number;
    payment_method: string;
    status: string;
    is_pos_sale: boolean;
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

export interface Repair {
    id: string;
    customer_name: string;
    customer_phone: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    imei?: string;
    issue_description: string;
    status: RepairStatus;
    estimated_cost?: number;
    final_cost?: number;
    technician_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface InventorySnapshot {
    id: string;
    total_capital: number;
    total_items: number;
    distribution: Record<string, { capital: number; quantity: number }>;
    created_at: string;
}

export interface FinancialReport {
    total_sales: number;
    total_profit: number;
    top_products: { name: string; revenue: number }[];
    sales_over_time: { date: string; amount: number }[];
}
