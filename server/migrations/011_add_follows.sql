-- Migration: Add follows table for user following functionality
-- This enables users to follow other breeders and see follower counts

CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_follow UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Add follower/following counts to profiles (optional, for caching)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
        UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update counts
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
CREATE TRIGGER update_follower_counts_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();
