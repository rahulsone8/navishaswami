-- ════════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SCHEMA FOR SHIVI'S BIRTHDAY CELEBRATION APP
-- Copy & Run this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ════════════════════════════════════════════════════════════════════

-- 1. Table for Birthday Wishes / Guestbook Messages
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    emoji TEXT DEFAULT '💖',
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table for Party Snaps Photo Album Metadata
CREATE TABLE IF NOT EXISTS public.party_photos (
    id TEXT PRIMARY KEY,
    uploader TEXT NOT NULL,
    src TEXT NOT NULL,
    public_id TEXT,
    bytes BIGINT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_photos ENABLE ROW LEVEL SECURITY;

-- 4. Public Access Policies (Allows all visitors to post & read wishes & photos)
DROP POLICY IF EXISTS "Public read and insert wishes" ON public.wishes;
CREATE POLICY "Public read and insert wishes" ON public.wishes
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public read and insert party_photos" ON public.party_photos;
CREATE POLICY "Public read and insert party_photos" ON public.party_photos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Enable Supabase Realtime for instant multi-device sync
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.wishes, public.party_photos;
COMMIT;
