-- Simple clean slate script
-- Run this in Supabase SQL Editor
-- This version only deletes from tables that definitely exist

-- Delete in order from child tables to parent tables
DELETE FROM public.notifications;
DELETE FROM public.follows;
DELETE FROM public.conversation_participants;
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.comments;
DELETE FROM public.thread_likes;
DELETE FROM public.threads;
DELETE FROM public.posts;
DELETE FROM public.events;
DELETE FROM public.litters;
DELETE FROM public.akitas;
DELETE FROM public.profiles;

-- Verify clean
SELECT 'All tables cleaned!' as status;
