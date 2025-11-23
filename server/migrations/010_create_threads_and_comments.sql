-- Drop existing tables to ensure clean state (since we are fixing a broken schema)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS threads CASCADE;

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threads
CREATE POLICY "Threads are viewable by everyone" 
    ON threads FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create threads" 
    ON threads FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own threads" 
    ON threads FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own threads" 
    ON threads FOR DELETE 
    USING (auth.uid() = author_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
    ON comments FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create comments" 
    ON comments FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
    ON comments FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
    ON comments FOR DELETE 
    USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_threads_author ON threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category);
CREATE INDEX IF NOT EXISTS idx_threads_last_active ON threads(last_active);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
