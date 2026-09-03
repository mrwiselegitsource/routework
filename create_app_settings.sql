CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to anyone" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow update access to anyone" ON public.app_settings FOR ALL USING (true);
