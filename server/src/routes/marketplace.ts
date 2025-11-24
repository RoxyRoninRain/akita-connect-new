import { Router, Request, Response } from 'express';
import { getSupabase } from '../db';

const router = Router();

// GET /api/marketplace - Get filtered litters for marketplace
router.get('/', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    const { location, status } = req.query;

    try {
        // Start building the query
        let query = supabase
            .from('litters')
            .select(`
                *,
                breeder:profiles!litters_breeder_id_fkey(id, name, kennel_name, location, avatar),
                sire:akitas!litters_sire_id_fkey(id, registered_name, call_name, images),
                dam:akitas!litters_dam_id_fkey(id, registered_name, call_name, images)
            `)
            .in('status', ['Available', 'Expecting', 'Planned'])
            .eq('approval_status', 'approved')
            .order('dob', { ascending: false });

        // Apply status filter if provided
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Apply location filter if provided
        // Note: This filters on litter.location field
        // For breeder location, we'd need to do client-side filtering or use a more complex query
        if (location && location !== 'all') {
            query = query.ilike('location', `%${location}%`);
        }

        const { data: litters, error } = await query;

        if (error) {
            console.error('Error fetching marketplace litters:', error);
            return res.status(500).json({ error: error.message });
        }

        res.json(litters || []);
    } catch (error: any) {
        console.error('Marketplace endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
