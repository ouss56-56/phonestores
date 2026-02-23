-- Create customer_requests table for inquiry form
CREATE TABLE IF NOT EXISTS public.customer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    product_id UUID REFERENCES public.products(id),
    type TEXT NOT NULL DEFAULT 'inquiry',
    message TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'fr',
    ref TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
-- Allow anonymous inserts (for the inquiry form)
CREATE POLICY "Enable insert for everyone" ON public.customer_requests FOR
INSERT WITH CHECK (true);
-- Allow authenticated users to read/update (admin panel)
CREATE POLICY "Enable read for authenticated users" ON public.customer_requests FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.customer_requests FOR
UPDATE USING (auth.role() = 'authenticated');