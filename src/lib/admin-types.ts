export interface Product {
    id: string;
    name: string;
    sku: string;
    imei?: string;
    brand: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
    is_featured: boolean;
    category: string;
    image_url?: string;
}

export interface Sale {
    id: string;
    date: string;
    customer_name: string;
    customer_phone?: string;
    items: SaleItem[];
    total_amount: number;
    payment_method: "cash" | "card" | "transfer";
}

export interface SaleItem {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface Repair {
    id: string;
    tracking_number: string;
    customer_name: string;
    device_model: string;
    imei?: string;
    issue_description: string;
    status: "pending" | "in_progress" | "completed" | "delivered";
    cost: number;
    created_at: string;
}

export interface FinancialReport {
    total_sales: number;
    total_profit: number;
    top_products: { name: string; revenue: number }[];
    sales_over_time: { date: string; amount: number }[];
}
