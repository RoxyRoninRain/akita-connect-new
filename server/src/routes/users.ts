import { Router, Request, Response } from 'express';
import { getSupabase, supabase as adminSupabase } from '../db';

const router = Router();

console.log('Loading users.ts route file...');

// GET /api/users - List all users (public profiles)
router.get('/', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const supabase = getSupabase(req.headers.authorization);
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
});

// POST /api/users - Create/Update user profile
router.post('/', async (req: Request, res: Response) => {
    const userData = req.body;
    const supabase = getSupabase(req.headers.authorization);

    const { data, error } = await supabase
        .from('profiles')
        .upsert([userData])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// PUT /api/users/:id - Update user profile
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // 1. Verify User Identity
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Missing authorization token' });
        }

        // Use a fresh client to verify the token
        const authClient = getSupabase(req.headers.authorization);
        const { data: { user }, error: authError } = await authClient.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (user.id !== id) {
            console.error(`User mismatch: Token ${user.id} !== Target ${id}`);
            return res.status(403).json({ error: 'Unauthorized to update this profile' });
        }

        // 2. Perform Update using Admin Client (Bypass RLS)
        const { data, error } = await adminSupabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Update Error:', error);
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(data[0]);
    } catch (err) {
        console.error('Handler Exception:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
