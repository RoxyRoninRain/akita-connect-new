-- Add category column to threads table
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
