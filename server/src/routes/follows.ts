import { Router } from 'express';
import { supabase } from '../db';

const router = Router();

// Follow a user
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.body.followerId;

        if (!followerId) {
            return res.status(400).json({ error: 'Follower ID required' });
        }

        if (followerId === userId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const { data, error } = await supabase
            .from('follows')
            .insert({
                follower_id: followerId,
                following_id: userId
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ error: 'Already following this user' });
            }
            throw error;
        }

        // Create notification for the user being followed
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'follow',
                title: 'New Follower',
                message: 'Someone started following you', // We'll enrich this with the follower's name if we fetch it, or just keep it generic for now. 
                // Ideally we fetch the follower's name. Let's do a quick fetch or just use a generic message.
                // Better: Fetch follower profile to get name.
                link: `/profile/${followerId}`
            });

        // Fetch follower name for better notification message
        const { data: followerProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', followerId)
            .single();

        if (followerProfile) {
            // Update the notification we just created with the specific name
            // Actually, let's just do it in one go if we fetch first.
            // Refactoring to fetch first.
        }

        // RE-DOING THE BLOCK TO BE CLEANER

        // Fetch follower profile first
        const { data: followerProfileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', followerId)
            .single();

        const followerName = followerProfileData?.name || 'Someone';

        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'follow',
                title: 'New Follower',
                message: `${followerName} started following you`,
                link: `/profile/${followerId}`
            });

        res.json(data);
    } catch (error: any) {
        console.error('Follow error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Unfollow a user
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { followerId } = req.query;

        if (!followerId) {
            return res.status(400).json({ error: 'Follower ID required' });
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', userId);

        if (error) throw error;

        res.json({ message: 'Unfollowed successfully' });
    } catch (error: any) {
        console.error('Unfollow error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('follows')
            .select(`
                follower_id,
                created_at,
                profiles!follows_follower_id_fkey (
                    id,
                    name,
                    kennel_name,
                    avatar,
                    location
                )
            `)
            .eq('following_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data || []);
    } catch (error: any) {
        console.error('Get followers error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get users that a user is following
router.get('/:userId/following', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('follows')
            .select(`
                following_id,
                created_at,
                profiles!follows_following_id_fkey (
                    id,
                    name,
                    kennel_name,
                    avatar,
                    location
                )
            `)
            .eq('follower_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data || []);
    } catch (error: any) {
        console.error('Get following error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check if user is following another user
router.get('/:userId/is-following', async (req, res) => {
    try {
        const { userId } = req.params;
        const { followerId } = req.query;

        if (!followerId) {
            return res.status(400).json({ error: 'Follower ID required' });
        }

        const { data, error } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', userId)
            .maybeSingle();

        if (error) throw error;

        res.json({ isFollowing: !!data });
    } catch (error: any) {
        console.error('Check following error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
