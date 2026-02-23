-- Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sub_category TEXT,
ADD COLUMN IF NOT EXISTS rotation_indicator TEXT CHECK (rotation_indicator IN ('high', 'medium', 'slow', 'dead')),
ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ;

-- Create accessory_batches table
CREATE TABLE IF NOT EXISTS public.accessory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0,
    supplier TEXT,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for accessory_batches
ALTER TABLE public.accessory_batches ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for accessory_batches
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'accessory_batches' AND policyname = 'Admins can manage accessory_batches'
    ) THEN
        CREATE POLICY "Admins can manage accessory_batches" ON public.accessory_batches 
        FOR ALL USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- Create index for accessory_batches
CREATE INDEX IF NOT EXISTS idx_accessory_batches_product ON public.accessory_batches(product_id);

-- Update inventory_snapshots to handle more detailed distribution if needed
-- (The existing JSONB distribution field is likely sufficient for now)
