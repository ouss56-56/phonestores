-- ============================================================
-- Admin Panel V2 Migration
-- Adds: stock_movements, suppliers, purchase_orders, customers,
--        finances, audit_logs, ai_logs, promotions, order_status_logs
-- Alters: products, orders, repairs
-- ============================================================
-- ============================================================
-- 1. ALTER EXISTING TABLES
-- ============================================================
-- Products: add admin-panel fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS imei_required BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS average_cost DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reorder_threshold INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS avg_daily_sales DECIMAL(8, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS days_to_depletion INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS barcode TEXT;
-- Orders: link to customer, POS reference, return tracking
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_id UUID,
    ADD COLUMN IF NOT EXISTS pos_reference TEXT,
    ADD COLUMN IF NOT EXISTS return_reason TEXT;
-- Repairs: enhanced tracking
ALTER TABLE public.repairs
ADD COLUMN IF NOT EXISTS tracking_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS customer_id UUID,
    ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS cost_actual DECIMAL(12, 2),
    ADD COLUMN IF NOT EXISTS signature_url TEXT;
-- Auto-generate repair tracking ID
CREATE OR REPLACE FUNCTION public.generate_repair_tracking_id() RETURNS TRIGGER AS $$ BEGIN IF NEW.tracking_id IS NULL THEN NEW.tracking_id := 'REP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
CREATE TRIGGER set_repair_tracking_id BEFORE
INSERT ON public.repairs FOR EACH ROW EXECUTE FUNCTION public.generate_repair_tracking_id();
-- ============================================================
-- 2. SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    payment_terms TEXT DEFAULT 'net_30',
    rating INTEGER DEFAULT 3 CHECK (
        rating >= 1
        AND rating <= 5
    ),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_suppliers_updated_at BEFORE
UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ============================================================
-- 3. PURCHASE ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES public.suppliers(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'submitted',
            'confirmed',
            'shipped',
            'received',
            'cancelled'
        )
    ),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    expected_delivery TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage purchase_orders" ON public.purchase_orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_purchase_orders_updated_at BEFORE
UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Auto PO number
CREATE OR REPLACE FUNCTION public.generate_po_number() RETURNS TRIGGER AS $$ BEGIN IF NEW.po_number IS NULL
    OR NEW.po_number = '' THEN NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
CREATE TRIGGER set_po_number BEFORE
INSERT ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.generate_po_number();
-- ============================================================
-- 4. PURCHASE ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage po_items" ON public.purchase_order_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- ============================================================
-- 5. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        segment TEXT NOT NULL DEFAULT 'regular' CHECK (segment IN ('vip', 'regular', 'inactive')),
        loyalty_points INTEGER NOT NULL DEFAULT 0,
        total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_customers_updated_at BEFORE
UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Add FK from orders to customers
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_customer_id_fkey'
) THEN
ALTER TABLE public.orders
ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE
SET NULL;
END IF;
END $$;
-- Add FK from repairs to customers
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'repairs_customer_id_fkey'
) THEN
ALTER TABLE public.repairs
ADD CONSTRAINT repairs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE
SET NULL;
END IF;
END $$;
-- ============================================================
-- 6. STOCK MOVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    change INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (
        type IN (
            'sale',
            'purchase',
            'adjustment',
            'return',
            'repair_use',
            'initial'
        )
    ),
    reference_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage stock_movements" ON public.stock_movements FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- ============================================================
-- 7. FINANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (
        type IN ('revenue', 'expense', 'purchase', 'payroll', 'other')
    ),
    category TEXT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    description TEXT,
    reference_id TEXT,
    reference_type TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage finances" ON public.finances FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- ============================================================
-- 8. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (
        action IN (
            'create',
            'update',
            'delete',
            'status_change',
            'login',
            'export'
        )
    ),
    entity TEXT NOT NULL,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit_logs" ON public.audit_logs FOR
SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit_logs" ON public.audit_logs FOR
INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- ============================================================
-- 9. AI LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature TEXT NOT NULL,
    input_hash TEXT,
    input_snapshot JSONB,
    output_summary TEXT,
    confidence DECIMAL(3, 2),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage ai_logs" ON public.ai_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- ============================================================
-- 10. PROMOTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (
        type IN (
            'discount_percent',
            'discount_fixed',
            'coupon',
            'bundle',
            'flash_sale'
        )
    ),
    value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    coupon_code TEXT UNIQUE,
    applicable_products UUID [] DEFAULT '{}',
    applicable_categories UUID [] DEFAULT '{}',
    min_purchase DECIMAL(12, 2) DEFAULT 0,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active promotions" ON public.promotions FOR
SELECT USING (
        is_active = true
        AND starts_at <= now()
        AND (
            ends_at IS NULL
            OR ends_at > now()
        )
    );
CREATE TRIGGER update_promotions_updated_at BEFORE
UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ============================================================
-- 11. ORDER STATUS LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_status_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage order_status_logs" ON public.order_status_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- ============================================================
-- 12. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_items_po ON public.purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON public.customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_finances_type ON public.finances(type);
CREATE INDEX IF NOT EXISTS idx_finances_date ON public.finances(date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_feature ON public.ai_logs(feature);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promotions_coupon ON public.promotions(coupon_code);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_order ON public.order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_customer ON public.repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_tracking ON public.repairs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);