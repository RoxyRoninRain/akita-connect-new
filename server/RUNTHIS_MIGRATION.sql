-- ===============================================
-- MIGRATION: Add Profile Fields
-- Run this in Supabase Dashboard > SQL Editor
-- ===============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_photo text,
ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kennel_name text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS years_of_experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('cover_photo', 'gallery', 'kennel_name', 'social_links', 'followers_count', 'following_count')
ORDER BY column_name;
