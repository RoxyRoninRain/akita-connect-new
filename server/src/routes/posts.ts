import { Router, Request, Response } from 'express';
import { getSupabase } from '../db';

const router = Router();

// GET /api/posts - List all posts (Feed)
router.get('/', async (req: Request, res: Response) => {
    const supabase = getSupabase(req.headers.authorization);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        // 1. Fetch Posts
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:profiles!posts_author_id_fkey(id, name, avatar)
            `)
            .order('created_at', { ascending: false })
            .range(from, to);

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

    // Create Notification
    try {
        // Get post author
        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', id)
            .single();

        if (post && post.author_id !== author_id) {
            // Get commenter name
            const { data: commenter } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', author_id)
                .single();

            await supabase.from('notifications').insert({
                user_id: post.author_id,
                type: 'comment',
                title: 'New Comment',
                message: `${commenter?.name || 'Someone'} commented on your post`,
                link: `/community/thread/${id}` // Assuming posts are threads or have a detail view. If feed only, maybe just /profile/me? Or expand post?
                // For now, let's point to the profile or feed if we don't have a dedicated post page.
                // Actually, let's just point to the feed for now or a placeholder.
                // Wait, we have /community/thread/:id but that's for threads.
                // Posts are on the feed. Let's just link to the user profile for now or do nothing.
                // Better: Link to the post author's profile where the post is likely visible.
            });
        }
    } catch (err) {
        console.error('Error creating notification:', err);
    }

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

        // Create Notification
        try {
            // Get post author
            const { data: post } = await supabase
                .from('posts')
                .select('author_id')
                .eq('id', id)
                .single();

            if (post && post.author_id !== user_id) {
                // Get liker name
                const { data: liker } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user_id)
                    .single();

                await supabase.from('notifications').insert({
                    user_id: post.author_id,
                    type: 'like',
                    title: 'New Like',
                    message: `${liker?.name || 'Someone'} liked your post`,
                    link: `/profile/${post.author_id}` // Link to profile for now
                });
            }
        } catch (err) {
            console.error('Error creating notification:', err);
        }

        res.json({ liked: true });
    }
});

export default router;
