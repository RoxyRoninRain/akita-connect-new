import { Router } from 'express';
import { supabase } from '../db';

const router = Router();

// Get user's notifications
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data || []);
    } catch (error: any) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;

        res.json({ count: count || 0 });
    } catch (error: any) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw error;

        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Notification deleted' });
    } catch (error: any) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create notification (for manual triggering)
router.post('/', async (req, res) => {
    try {
        const { userId, type, title, message, link } = req.body;

        if (!userId || !type || !title) {
            return res.status(400).json({ error: 'userId, type, and title are required' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                link
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Create notification error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
