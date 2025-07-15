-- Remove existing tables
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.exchange_rates CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create storage bucket for extension files
INSERT INTO storage.buckets (id, name, public) VALUES ('extensions', 'extensions', true);

-- Create policies for extension storage
CREATE POLICY "Extension files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'extensions');

CREATE POLICY "Allow public upload of extensions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'extensions');