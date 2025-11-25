import { Router, Request, Response } from 'express';
import { getSupabase } from '../db';

const router = Router();

// GET /api/litters - List all litters
router.get('/', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);

    // 1. Fetch litters
    const { data: litters, error: littersError } = await supabase
        .from('litters')
        .select('*');

    if (littersError) {
        console.error('Error fetching litters:', littersError);
        return res.status(500).json({ error: littersError.message });
    }

    if (!litters || litters.length === 0) {
        return res.json([]);
    }

    // 2. Collect IDs
    const breederIds = [...new Set(litters.map(l => l.breeder_id).filter(Boolean))];
    const akitaIds = [...new Set([
        ...litters.map(l => l.sire_id).filter(Boolean),
        ...litters.map(l => l.dam_id).filter(Boolean)
    ])];

    // 3. Fetch related data in parallel
    const [profilesResult, akitasResult] = await Promise.all([
        supabase.from('profiles').select('*').in('id', breederIds),
        supabase.from('akitas').select('*').in('id', akitaIds)
    ]);

    if (profilesResult.error) console.error('Error fetching profiles:', profilesResult.error);
    if (akitasResult.error) console.error('Error fetching akitas:', akitasResult.error);

    const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || []);
    const akitasMap = new Map(akitasResult.data?.map(a => [a.id, a]) || []);

    // 4. Attach data
    const populatedLitters = litters.map(litter => ({
        ...litter,
        breeder: profilesMap.get(litter.breeder_id) || null,
        sire: akitasMap.get(litter.sire_id) || null,
        dam: akitasMap.get(litter.dam_id) || null
    }));

    res.json(populatedLitters);
});

// POST /api/litters - Create new litter
router.post('/', async (req: Request, res: Response) => {
    const litterData = req.body;
    const supabase = getSupabase(req.headers.authorization);

    // Default to pending approval
    litterData.approval_status = 'pending';

    const { data, error } = await supabase
        .from('litters')
        .insert([litterData])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// PUT /api/litters/:id/approve - Approve litter (Moderator only)
router.put('/:id/approve', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { approved_by } = req.body;
    const supabase = getSupabase(req.headers.authorization);

    const { data, error } = await supabase
        .from('litters')
        .update({
            approval_status: 'approved',
            approved_by,
            approval_date: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, breeder_id, sire_id, dam_id')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // Create notification for breeder
    if (data.breeder_id) {
        // Get litter details for notification message
        const { data: sireData } = await supabase
            .from('akitas')
            .select('call_name')
            .eq('id', data.sire_id)
            .single();

        const { data: damData } = await supabase
            .from('akitas')
            .select('call_name')
            .eq('id', data.dam_id)
            .single();

        const litterName = sireData && damData
            ? `${sireData.call_name} x ${damData.call_name} litter`
            : 'Your litter';

        await supabase
            .from('notifications')
            .insert({
                user_id: data.breeder_id,
                type: 'litter_approved',
                title: 'Litter Approved',
                message: `${litterName} has been approved and is now visible in the marketplace`,
                link: `/marketplace`
            });
    }

    res.json(data);
});

// PUT /api/litters/:id/reject - Reject litter
router.put('/:id/reject', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const supabase = getSupabase(req.headers.authorization);

    const { data, error } = await supabase
        .from('litters')
        .update({
            approval_status: 'rejected',
            rejection_reason
        })
        .eq('id', id)
        .select('id, breeder_id, sire_id, dam_id')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // Create notification for breeder
    if (data.breeder_id) {
        // Get litter details for notification message
        const { data: sireData } = await supabase
            .from('akitas')
            .select('call_name')
            .eq('id', data.sire_id)
            .single();

        const { data: damData } = await supabase
            .from('akitas')
            .select('call_name')
            .eq('id', data.dam_id)
            .single();

        const litterName = sireData && damData
            ? `${sireData.call_name} x ${damData.call_name} litter`
            : 'Your litter';

        await supabase
            .from('notifications')
            .insert({
                user_id: data.breeder_id,
                type: 'litter_rejected',
                title: 'Litter Not Approved',
                message: `${litterName} was not approved. Reason: ${rejection_reason || 'No reason provided'}`,
                link: `/profile`
            });
    }

    res.json(data);
});

// PUT /api/litters/:id - Update litter (e.g. add puppies)
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getSupabase(req.headers.authorization);

    const { data, error } = await supabase
        .from('litters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// POST /api/litters/:litterId/puppies/:puppyId/weight - Add weight entry
router.post('/:litterId/puppies/:puppyId/weight', async (req: Request, res: Response) => {
    const { litterId, puppyId } = req.params;
    const { date, weight } = req.body;
    const supabase = getSupabase(req.headers.authorization);

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get the litter
        const { data: litter, error: fetchError } = await supabase
            .from('litters')
            .select('*')
            .eq('id', litterId)
            .single();

        if (fetchError || !litter) {
            return res.status(404).json({ error: 'Litter not found' });
        }

        // Verify ownership
        if (litter.breeder_id !== user.id) {
            return res.status(403).json({ error: 'Only the breeder can add weights' });
        }

        // Find and update the puppy
        const puppies = litter.puppies || [];
        const puppyIndex = puppies.findIndex((p: any) => p.id === puppyId);

        if (puppyIndex === -1) {
            return res.status(404).json({ error: 'Puppy not found in litter' });
        }

        const puppy = puppies[puppyIndex];
        const growthHistory = puppy.growthHistory || [];

        // Add new weight entry
        growthHistory.push({ date, weight });

        // Sort by date
        growthHistory.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        puppy.growthHistory = growthHistory;
        puppies[puppyIndex] = puppy;

        // Update litter
        const { data: updatedLitter, error: updateError } = await supabase
            .from('litters')
            .update({ puppies })
            .eq('id', litterId)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json(updatedLitter);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/litters/:litterId/growth-chart - Get growth data for chart
router.get('/:litterId/growth-chart', async (req: Request, res: Response) => {
    const { litterId } = req.params;
    const supabase = getSupabase(req.headers.authorization);

    try {
        const { data: litter, error } = await supabase
            .from('litters')
            .select('*')
            .eq('id', litterId)
            .single();

        if (error || !litter) {
            return res.status(404).json({ error: 'Litter not found' });
        }

        // Format data for chart
        const puppies = litter.puppies || [];
        const chartData = puppies.map((puppy: any) => ({
            puppyId: puppy.id,
            puppyName: puppy.name,
            color: puppy.color,
            growthHistory: puppy.growthHistory || []
        }));

        res.json(chartData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
