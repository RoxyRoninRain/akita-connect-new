-- Migration: Create Storage Buckets for Images
-- This migration sets up Supabase Storage for user avatars and post images

-- Note: Storage buckets must be created via Supabase Dashboard or API
-- This SQL provides the RLS policies for the buckets

-- Policies for 'avatars' bucket (assumed to be created)
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view avatars (public read)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policies for 'posts' bucket (for post images)
-- Allow authenticated users to upload post images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

 -- Allow users to delete their own post images
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'posts'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view post images (public read)
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');
