import { Router, Request, Response } from 'express';
import { supabase } from '../db';

const router = Router();

// GET /api/akitas - List all akitas
router.get('/', async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('akitas')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// GET /api/akitas/:id - Get single akita
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('akitas')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return res.status(404).json({ error: 'Akita not found' });
    }

    res.json(data);
});

// POST /api/akitas - Create new akita
router.post('/', async (req: Request, res: Response) => {
    const akitaData = req.body;

    // Basic validation
    if (!akitaData.registered_name || !akitaData.call_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
        .from('akitas')
        .insert([akitaData])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// PUT /api/akitas/:id - Update akita
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
        .from('akitas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// GET /api/akitas/:id/pedigree - Get pedigree tree (3 generations)
router.get('/:id/pedigree', async (req: Request, res: Response) => {
    const { id } = req.params;

    // Recursive function to fetch ancestors
    const fetchAncestors = async (akitaId: string, depth: number = 0): Promise<any> => {
        if (depth > 2) return null; // Limit to 3 generations (0, 1, 2 = self, parents, grandparents)

        const { data: akita, error } = await supabase
            .from('akitas')
            .select('*')
            .eq('id', akitaId)
            .single();

        if (error || !akita) return null;

        // Recursively fetch sire and dam
        const sire = akita.sire_id ? await fetchAncestors(akita.sire_id, depth + 1) : null;
        const dam = akita.dam_id ? await fetchAncestors(akita.dam_id, depth + 1) : null;

        return {
            ...akita,
            sire,
            dam
        };
    };

    try {
        const pedigree = await fetchAncestors(id);
        if (!pedigree) {
            return res.status(404).json({ error: 'Akita not found' });
        }
        res.json(pedigree);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
