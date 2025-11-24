-- Migration: Setup additional storage buckets
-- This migration sets up Supabase Storage policies for threads, messages, and akitas buckets

-- Policies for 'threads' bucket
-- Allow authenticated users to upload thread images
CREATE POLICY "Authenticated users can upload thread images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'threads');

-- Allow anyone to view thread images
CREATE POLICY "Anyone can view thread images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'threads');

-- Policies for 'messages' bucket
-- Allow authenticated users to upload message attachments
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');

-- Allow authenticated users to view message attachments (if they have the link)
-- Note: Ideally we'd check conversation participation, but storage policies are limited.
-- For now, we allow authenticated users to view.
CREATE POLICY "Authenticated users can view message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'messages');

-- Policies for 'akitas' bucket
-- Allow authenticated users to upload akita images
CREATE POLICY "Authenticated users can upload akita images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'akitas');

-- Allow anyone to view akita images
CREATE POLICY "Anyone can view akita images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'akitas');
