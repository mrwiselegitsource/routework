-- News Table
CREATE TABLE public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path TEXT NOT NULL,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Assuming it exists, adding 'active' flag if not present)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Security Policies (RLS)

-- News RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Anyone can read news
CREATE POLICY "Public can read news" ON public.news
    FOR SELECT USING (true);

-- Only authenticated users (admins) can insert/update/delete news
CREATE POLICY "Admins can insert news" ON public.news
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update news" ON public.news
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete news" ON public.news
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Page Views RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a page view
CREATE POLICY "Public can insert page views" ON public.page_views
    FOR INSERT WITH CHECK (true);

-- Only admins can read page views
CREATE POLICY "Admins can read page views" ON public.page_views
    FOR SELECT USING (auth.uid() IS NOT NULL);
