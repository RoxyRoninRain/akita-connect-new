"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/events - List all events
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, upcoming } = req.query;
    // Use admin client for public read to ensure no RLS issues, though policy allows public read
    const supabase = db_1.supabase;
    try {
        let query = supabase
            .from('events')
            .select(`
                *,
                organizer:profiles!events_organizer_id_fkey(id, name, avatar),
                rsvps:event_rsvps(id, user_id, status)
            `)
            .order('start_date', { ascending: true });
        // Filter by type if provided
        if (type && type !== 'all') {
            query = query.eq('event_type', type);
        }
        // Filter upcoming events only
        if (upcoming === 'true' || upcoming === 'upcoming') {
            query = query.gte('start_date', new Date().toISOString());
        }
        else if (upcoming === 'past') {
            query = query.lt('start_date', new Date().toISOString());
        }
        const { data, error } = yield query;
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// GET /api/events/:id - Get event by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const supabase = db_1.supabase;
    try {
        const { data, error } = yield supabase
            .from('events')
            .select(`
                *,
                organizer:profiles!events_organizer_id_fkey(id, name, avatar),
                rsvps:event_rsvps(id, user_id, status, user:profiles!event_rsvps_user_id_fkey(id, name, avatar))
            `)
            .eq('id', id)
            .single();
        if (error || !data) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/events - Create event
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Frontend mapper sends snake_case field names
    const { title, description, event_type, location, address, start_date, end_date, max_attendees, image_url, organizer_id } = req.body;
    const authClient = (0, db_1.getSupabase)(req.headers.authorization);
    console.log('📅 Event creation request:', { title, event_type, location, start_date, body: req.body });
    try {
        // Validate required fields
        if (!title || !event_type || !location || !start_date) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'Missing required fields: title, event_type, location, and start_date are required' });
        }
        const { data: { user } } = yield authClient.auth.getUser();
        if (!user) {
            console.log('❌ No user authenticated');
            return res.status(401).json({ error: 'Not authenticated' });
        }
        console.log('✅ User authenticated:', user.id);
        // Check if user profile exists, create if it doesn't
        const { data: existingProfile } = yield db_1.supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
        if (!existingProfile) {
            console.log('📝 Creating user profile for:', user.id);
            const { error: profileError } = yield db_1.supabase
                .from('profiles')
                .insert({
                id: user.id,
                name: ((_a = user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'User',
                email: user.email
            });
            if (profileError) {
                console.log('❌ Failed to create profile:', profileError.message);
                return res.status(500).json({ error: 'Failed to create user profile: ' + profileError.message });
            }
            console.log('✅ Profile created');
        }
        // Convert date strings to ISO timestamp format
        const startDateISO = new Date(start_date).toISOString();
        const endDateISO = end_date ? new Date(end_date).toISOString() : null;
        const eventData = {
            title,
            description,
            event_type,
            location,
            address,
            start_date: startDateISO,
            end_date: endDateISO,
            max_attendees,
            image_url,
            organizer_id: organizer_id || user.id // Use organizer_id from body or fall back to authenticated user
        };
        console.log('📝 Inserting event data:', eventData);
        const { data, error } = yield db_1.supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();
        if (error) {
            console.log('❌ Database error:', error.message, error);
            return res.status(500).json({ error: error.message });
        }
        console.log('✅ Event created successfully:', data.id);
        res.json(data);
    }
    catch (error) {
        console.log('❌ Server error:', error.message, error);
        res.status(500).json({ error: error.message });
    }
}));
// PUT /api/events/:id - Update event
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, eventType, location, address, startDate, endDate, maxAttendees, imageUrl } = req.body;
    const authClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user } } = yield authClient.auth.getUser();
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Verify ownership
        const { data: existingEvent } = yield db_1.supabase
            .from('events')
            .select('organizer_id')
            .eq('id', id)
            .single();
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (existingEvent.organizer_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized to update this event' });
        }
        const { data, error } = yield db_1.supabase
            .from('events')
            .update({
            title,
            description,
            event_type: eventType,
            location,
            address,
            start_date: startDate,
            end_date: endDate,
            max_attendees: maxAttendees,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// DELETE /api/events/:id - Delete event
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const authClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user } } = yield authClient.auth.getUser();
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Verify ownership
        const { data: existingEvent } = yield db_1.supabase
            .from('events')
            .select('organizer_id')
            .eq('id', id)
            .single();
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (existingEvent.organizer_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this event' });
        }
        const { error } = yield db_1.supabase
            .from('events')
            .delete()
            .eq('id', id);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/events/:id/rsvp - RSVP to event
router.post('/:id/rsvp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const authClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user } } = yield authClient.auth.getUser();
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Get event details including organizer
        const { data: event, error: eventError } = yield db_1.supabase
            .from('events')
            .select('id, title, organizer_id')
            .eq('id', id)
            .single();
        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Upsert RSVP (insert or update if exists)
        const { data, error } = yield db_1.supabase
            .from('event_rsvps')
            .upsert({
            event_id: id,
            user_id: user.id,
            status
        }, {
            onConflict: 'event_id,user_id'
        })
            .select()
            .single();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        // Create notification for event organizer (if not RSVPing to own event)
        if (event.organizer_id && event.organizer_id !== user.id && status === 'going') {
            // Get user's profile for notification message
            const { data: userProfile } = yield db_1.supabase
                .from('profiles')
                .select('name')
                .eq('id', user.id)
                .single();
            const userName = (userProfile === null || userProfile === void 0 ? void 0 : userProfile.name) || 'Someone';
            // Create notification
            yield db_1.supabase
                .from('notifications')
                .insert({
                user_id: event.organizer_id,
                type: 'rsvp',
                title: 'New RSVP',
                message: `${userName} is attending "${event.title}"`,
                link: `/events/${event.id}`
            });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// DELETE /api/events/:id/rsvp - Remove RSVP
router.delete('/:id/rsvp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const authClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user } } = yield authClient.auth.getUser();
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { error } = yield db_1.supabase
            .from('event_rsvps')
            .delete()
            .eq('event_id', id)
            .eq('user_id', user.id);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
