import { Router, Request, Response } from 'express';
import { getSupabase } from '../db';

const router = Router();

// POST /api/akitas/:id/health-records - Add health record
router.post('/:id/health-records', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type, result, date, certificateImage } = req.body;
    const supabase = getSupabase(req.headers.authorization);

    try {
        // Get current health records
        const { data: akita, error: fetchError } = await supabase
            .from('akitas')
            .select('health_records, owner_id')
            .eq('id', id)
            .single();

        if (fetchError || !akita) {
            return res.status(404).json({ error: 'Akita not found' });
        }

        // Verify ownership
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || akita.owner_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Create new health record with ID
        const newRecord = {
            id: `hr_${Date.now()}`,
            type,
            result,
            date,
            certificate_image: certificateImage
        };

        // Append to existing health records
        const healthRecords = akita.health_records || [];
        healthRecords.push(newRecord);

        // Update akita with new health records
        const { data, error: updateError } = await supabase
            .from('akitas')
            .update({ health_records: healthRecords })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/akitas/:id/health-records/:recordId - Update health record
router.put('/:id/health-records/:recordId', async (req: Request, res: Response) => {
    const { id, recordId } = req.params;
    const { type, result, date, certificateImage } = req.body;
    const supabase = getSupabase(req.headers.authorization);

    try {
        // Get current health records
        const { data: akita, error: fetchError } = await supabase
            .from('akitas')
            .select('health_records, owner_id')
            .eq('id', id)
            .single();

        if (fetchError || !akita) {
            return res.status(404).json({ error: 'Akita not found' });
        }

        // Verify ownership
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || akita.owner_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update the specific health record
        const healthRecords = akita.health_records || [];
        const recordIndex = healthRecords.findIndex((r: any) => r.id === recordId);

        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Health record not found' });
        }

        healthRecords[recordIndex] = {
            id: recordId,
            type,
            result,
            date,
            certificate_image: certificateImage
        };

        // Update akita with modified health records
        const { data, error: updateError } = await supabase
            .from('akitas')
            .update({ health_records: healthRecords })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/akitas/:id/health-records/:recordId - Delete health record
router.delete('/:id/health-records/:recordId', async (req: Request, res: Response) => {
    const { id, recordId } = req.params;
    const supabase = getSupabase(req.headers.authorization);

    try {
        // Get current health records
        const { data: akita, error: fetchError } = await supabase
            .from('akitas')
            .select('health_records, owner_id')
            .eq('id', id)
            .single();

        if (fetchError || !akita) {
            return res.status(404).json({ error: 'Akita not found' });
        }

        // Verify ownership
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || akita.owner_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Remove the specific health record
        const healthRecords = (akita.health_records || []).filter((r: any) => r.id !== recordId);

        // Update akita with filtered health records
        const { data, error: updateError } = await supabase
            .from('akitas')
            .update({ health_records: healthRecords })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
