-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS event_rsvps;
DROP TABLE IF EXISTS events;

-- Re-create Events table with explicit constraint name
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('show', 'meetup', 'seminar', 'other')),
    location TEXT NOT NULL,
    address TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    max_attendees INTEGER,
    image_url TEXT,
    organizer_id UUID NOT NULL, -- Make it NOT NULL to be safe
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.profiles(id)
);

-- Re-create Event RSVPs table with explicit constraint names
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id),
    CONSTRAINT event_rsvps_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT event_rsvps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Organizers can update their events"
    ON events FOR UPDATE
    USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events"
    ON events FOR DELETE
    USING (auth.uid() = organizer_id);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVPs are viewable by everyone"
    ON event_rsvps FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create RSVPs"
    ON event_rsvps FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their RSVPs"
    ON event_rsvps FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their RSVPs"
    ON event_rsvps FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user ON event_rsvps(user_id);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
