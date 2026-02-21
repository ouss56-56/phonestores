
-- Fix search_path for generate_sku
CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL THEN
    NEW.sku := UPPER(LEFT(NEW.brand, 3)) || '-' || UPPER(LEFT(NEW.type, 2)) || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix search_path for generate_order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'LBC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
