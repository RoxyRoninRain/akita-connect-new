import { Router, Request, Response } from 'express';
import { getSupabase } from '../db';

const router = Router();

// GET /api/posts - List all posts (Feed)
router.get('/', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    try {
        // 1. Fetch Posts
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:profiles(id, name, avatar)
            `)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Posts fetch error:', error.message);
            return res.json([]);
        }
        if (!posts || posts.length === 0) return res.json([]);

        // 2. Fetch related data (Comments, Likes) for these posts
        const postIds = posts.map(p => p.id);
        const [commentsResult, likesResult] = await Promise.all([
            supabase.from('comments').select('*, author:profiles(name)').in('post_id', postIds).order('created_at'),
            supabase.from('likes').select('user_id, post_id').in('post_id', postIds)
        ]);

        const commentsMap = new Map(); // post_id -> comments[]
        const likesMap = new Map(); // post_id -> user_ids[]
        commentsResult.data?.forEach(c => {
            const list = commentsMap.get(c.post_id) || [];
            list.push(c);
            commentsMap.set(c.post_id, list);
        });
        likesResult.data?.forEach(l => {
            const list = likesMap.get(l.post_id) || [];
            list.push(l.user_id);
            likesMap.set(l.post_id, list);
        });

        // 3. Attach data
        const populatedPosts = posts.map(post => ({
            ...post,
            comments: commentsMap.get(post.id) || [],
            likes: likesMap.get(post.id) || []
        }));
        res.json(populatedPosts);
    } catch (e) {
        console.error('❌ Unexpected error in GET /posts:', e);
        res.json([]);
    }
});

// POST /api/posts - Create new post
router.post('/', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    const { author_id, content, images } = req.body;
    const { data, error } = await supabase
        .from('posts')
        .insert([{ author_id, content, images }])
        .select()
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// POST /api/posts/:id/comment - Add comment to post
router.post('/:id/comment', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    const { id } = req.params;
    const { author_id, content } = req.body;
    const { data, error } = await supabase
        .from('comments')
        .insert([{ author_id, content, post_id: id }])
        .select()
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    const { id } = req.params;
    const { user_id } = req.body;
    const { data: existing } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user_id)
        .eq('post_id', id)
        .single();
    if (existing) {
        await supabase.from('likes').delete().eq('user_id', user_id).eq('post_id', id);
        res.json({ liked: false });
    } else {
        await supabase.from('likes').insert([{ user_id, post_id: id }]);
        res.json({ liked: true });
    }
});

export default router;
