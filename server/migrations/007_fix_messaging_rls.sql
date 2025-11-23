-- Fix RLS policy for conversation_participants INSERT
-- The current policy creates a chicken-and-egg problem
-- Drop the old policy and create a simpler one

DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;

-- New policy: Users can add themselves or add others to conversations where they're already a participant
CREATE POLICY "Users can add participants" ON conversation_participants
FOR INSERT WITH CHECK (
    -- Allow if the user is adding themselves
    user_id = auth.uid()
    OR
    -- Or if the user is already a participant in the conversation
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
);

-- Also ensure service role can bypass RLS (it should by default, but let's be explicit)
-- Service role key operations ignore RLS policies by default
