import { Router, Request, Response } from 'express';
import { getSupabase, supabase as adminClient } from '../db';

const router = Router();

// GET /api/events - List all events
router.get('/', async (req: Request, res: Response) => {
    const { type, upcoming } = req.query;
    // Use admin client for public read to ensure no RLS issues, though policy allows public read
    const supabase = adminClient;

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
        } else if (upcoming === 'past') {
            query = query.lt('start_date', new Date().toISOString());
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/events/:id - Get event by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const supabase = adminClient;

    try {
        const { data, error } = await supabase
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/events - Create event
router.post('/', async (req: Request, res: Response) => {
    // Frontend mapper sends snake_case field names
    const { title, description, event_type, location, address, start_date, end_date, max_attendees, image_url, organizer_id } = req.body;
    const authClient = getSupabase(req.headers.authorization);

    console.log('📅 Event creation request:', { title, event_type, location, start_date, body: req.body });

    try {
        // Validate required fields
        if (!title || !event_type || !location || !start_date) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'Missing required fields: title, event_type, location, and start_date are required' });
        }

        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            console.log('❌ No user authenticated');
            return res.status(401).json({ error: 'Not authenticated' });
        }

        console.log('✅ User authenticated:', user.id);

        // Check if user profile exists, create if it doesn't
        const { data: existingProfile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existingProfile) {
            console.log('📝 Creating user profile for:', user.id);
            const { error: profileError } = await adminClient
                .from('profiles')
                .insert({
                    id: user.id,
                    name: user.email?.split('@')[0] || 'User',
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
            organizer_id: organizer_id || user.id  // Use organizer_id from body or fall back to authenticated user
        };

        console.log('📝 Inserting event data:', eventData);

        const { data, error } = await adminClient
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
    } catch (error: any) {
        console.log('❌ Server error:', error.message, error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, eventType, location, address, startDate, endDate, maxAttendees, imageUrl } = req.body;
    const authClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Verify ownership
        const { data: existingEvent } = await adminClient
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

        const { data, error } = await adminClient
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const authClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Verify ownership
        const { data: existingEvent } = await adminClient
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

        const { error } = await adminClient
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/events/:id/rsvp - RSVP to event
router.post('/:id/rsvp', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const authClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Upsert RSVP (insert or update if exists)
        const { data, error } = await adminClient
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

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/events/:id/rsvp - Remove RSVP
router.delete('/:id/rsvp', async (req: Request, res: Response) => {
    const { id } = req.params;
    const authClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { error } = await adminClient
            .from('event_rsvps')
            .delete()
            .eq('event_id', id)
            .eq('user_id', user.id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
