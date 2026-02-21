
-- Roles enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'phone' CHECK (type IN ('phone', 'accessory', 'spare_part')),
    parent_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    type TEXT NOT NULL DEFAULT 'phone' CHECK (type IN ('phone', 'accessory', 'spare_part')),
    description TEXT,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    sku TEXT UNIQUE,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    color TEXT,
    storage_capacity TEXT,
    warranty_months INTEGER DEFAULT 0,
    compatible_models TEXT[] DEFAULT '{}',
    supplier TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-generate SKU
CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL THEN
    NEW.sku := UPPER(LEFT(NEW.brand, 3)) || '-' || UPPER(LEFT(NEW.type, 2)) || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_sku BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.generate_sku();

-- IMEI tracking
CREATE TABLE public.imei_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    imei TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned', 'defective', 'reserved')),
    batch_number TEXT,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sold_at TIMESTAMPTZ
);
ALTER TABLE public.imei_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage IMEI" ON public.imei_records FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    notes TEXT,
    is_pos_sale BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Order items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    imei_id UUID REFERENCES public.imei_records(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'LBC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Repair/maintenance system
CREATE TABLE public.repairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    device_type TEXT NOT NULL,
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    imei TEXT,
    issue_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'diagnosing', 'waiting_parts', 'repairing', 'ready', 'delivered', 'cancelled')),
    estimated_cost DECIMAL(12,2),
    final_cost DECIMAL(12,2),
    technician_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage repairs" ON public.repairs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Inventory snapshots
CREATE TABLE public.inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_capital DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_items INTEGER NOT NULL DEFAULT 0,
    distribution JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage snapshots" ON public.inventory_snapshots FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON public.repairs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_type ON public.products(type);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_imei_product ON public.imei_records(product_id);
CREATE INDEX idx_imei_status ON public.imei_records(status);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_repairs_status ON public.repairs(status);
