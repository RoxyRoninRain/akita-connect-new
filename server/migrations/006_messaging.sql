-- Migration: Create messaging tables
-- This migration adds support for direct messaging between users

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table (many-to-many between users and conversations)
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can see conversations they're part of
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = conversations.id
            AND conversation_participants.user_id = auth.uid()
        )
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (true);

-- RLS Policies for conversation_participants
-- Users can view participants in their conversations
CREATE POLICY "Users can view participants in their conversations"
    ON conversation_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

-- Users can add participants to conversations they're in
CREATE POLICY "Users can add participants"
    ON conversation_participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
        OR
        conversation_participants.user_id = auth.uid()
    );

-- Users can update their own participant record (for last_read_at)
CREATE POLICY "Users can update their participant record"
    ON conversation_participants FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages
-- Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = auth.uid()
        )
    );

-- Users can send messages to conversations they're part of
CREATE POLICY "Users can send messages to their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = auth.uid()
        )
    );

-- Function to update conversation updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is sent
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();
