import { Router } from 'express';
import { supabase } from '../db';

const router = Router();

// Search across users, akitas, and posts
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const searchTerm = q.toLowerCase();

        // Search users
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, name, kennel_name, avatar, location, role')
            .or(`name.ilike.%${searchTerm}%,kennel_name.ilike.%${searchTerm}%`)
            .limit(5);

        if (usersError) throw usersError;

        // Search akitas
        const { data: akitas, error: akitasError } = await supabase
            .from('akitas')
            .select('id, registered_name, call_name, color, images, owner_id, titles')
            .or(`registered_name.ilike.%${searchTerm}%,call_name.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%`)
            .limit(10);

        if (akitasError) throw akitasError;

        // Search posts
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select(`
                id,
                content,
                created_at,
                author_id,
                profiles (name, avatar)
            `)
            .ilike('content', `%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (postsError) throw postsError;

        // Transform posts to include author info at top level
        const transformedPosts = posts?.map((post: any) => ({
            ...post,
            author_name: post.profiles?.name,
            author_avatar: post.profiles?.avatar
        })) || [];

        res.json({
            users: users || [],
            akitas: akitas || [],
            posts: transformedPosts
        });
    } catch (error: any) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
