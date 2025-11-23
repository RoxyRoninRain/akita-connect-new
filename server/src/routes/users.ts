import { Router, Request, Response } from 'express';
import { supabase } from '../db';

const router = Router();

// GET /api/users - List all users (public profiles)
router.get('/', async (req: Request, res: Response) => {
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

// POST /api/users - Create/Update user profile (usually handled by auth hook, but here for manual)
router.post('/', async (req: Request, res: Response) => {
    const userData = req.body;

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

export default router;
