-- Add columns to threads table
ALTER TABLE threads 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add reputation to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- Create thread_likes table
CREATE TABLE IF NOT EXISTS thread_likes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, thread_id)
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, comment_id)
);

-- Enable RLS
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for thread_likes
CREATE POLICY "Users can view all thread likes" 
    ON thread_likes FOR SELECT 
    USING (true);

CREATE POLICY "Users can toggle their own thread likes" 
    ON thread_likes FOR ALL 
    USING (auth.uid() = user_id);

-- RLS Policies for comment_likes
CREATE POLICY "Users can view all comment likes" 
    ON comment_likes FOR SELECT 
    USING (true);

CREATE POLICY "Users can toggle their own comment likes" 
    ON comment_likes FOR ALL 
    USING (auth.uid() = user_id);
