-- Events table
CREATE TABLE IF NOT EXISTS events (
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
    organizer_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- RLS Policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view events
CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Organizers can update their own events
CREATE POLICY "Organizers can update their events"
    ON events FOR UPDATE
    USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete their events"
    ON events FOR DELETE
    USING (auth.uid() = organizer_id);

-- RLS Policies for event_rsvps
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can view RSVPs
CREATE POLICY "RSVPs are viewable by everyone"
    ON event_rsvps FOR SELECT
    USING (true);

-- Authenticated users can create RSVPs
CREATE POLICY "Authenticated users can create RSVPs"
    ON event_rsvps FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own RSVPs
CREATE POLICY "Users can update their RSVPs"
    ON event_rsvps FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own RSVPs
CREATE POLICY "Users can delete their RSVPs"
    ON event_rsvps FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
