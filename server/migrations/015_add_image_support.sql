-- Migration: Add image support to threads, comments, and messages
-- This migration adds columns to store image URLs for threads, replies, and message attachments

-- Add images column to threads table
ALTER TABLE threads 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add images column to comments table  
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add attachments column to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN threads.images IS 'Array of image URLs attached to the thread';
COMMENT ON COLUMN comments.images IS 'Array of image URLs attached to the reply/comment';
COMMENT ON COLUMN messages.attachments IS 'Array of image URLs attached to the message';
