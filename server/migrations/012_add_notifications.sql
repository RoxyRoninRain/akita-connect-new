-- Migration: Add notifications table
-- Enables users to receive notifications for various actions

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'message', 'follow', 'like', 'comment', 'rsvp', 'litter_approved'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500), -- URL to navigate to when clicked
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT DEFAULT NULL,
    p_link VARCHAR(500) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for new follow notifications
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
    follower_name TEXT;
BEGIN
    SELECT name INTO follower_name FROM profiles WHERE id = NEW.follower_id;
    
    PERFORM create_notification(
        NEW.following_id,
        'follow',
        'New Follower',
        follower_name || ' started following you',
        '/profile/' || NEW.follower_id::TEXT
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS new_follower_notification ON follows;
CREATE TRIGGER new_follower_notification
    AFTER INSERT ON follows
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_follower();
