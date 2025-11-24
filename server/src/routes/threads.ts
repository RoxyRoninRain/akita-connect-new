
import { Router, Request, Response } from 'express';
import { getSupabase, supabase } from '../db';

const router = Router();

// GET /api/threads - List all threads
router.get('/', async (req: Request, res: Response) => {
    const userClient = getSupabase(req.headers.authorization);
    const adminClient = supabase; // Use admin for complex joins if needed, or just standard client
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        // Get current user for "has_liked" check
        const { data: { user } } = await userClient.auth.getUser();
        const currentUserId = user?.id;

        // Fetch threads with author and counts
        // Note: Supabase .select() with count is tricky for nested relations in one go without foreign keys set up perfectly for it.
        // We'll fetch threads first, then enrich.
        const { data: threads, error } = await adminClient
            .from('threads')
            .select(`
                *,
                author:profiles!threads_author_id_fkey(id, name, avatar, reputation)
            `)
            .order('is_pinned', { ascending: false })
            .order('last_active', { ascending: false })
            .range(from, to);

        if (error) {
            // If table doesn't exist, return empty array instead of 500
            console.log('Threads query error:', error.message);
            if (error.message.includes('relation') || error.message.includes('does not exist')) {
                return res.json([]);
            }
            return res.status(500).json({ error: error.message });
        }

        if (!threads || threads.length === 0) {
            return res.json([]);
        }

        // Enrich with likes count and user_has_liked
        const enrichedThreads = await Promise.all(threads.map(async (thread: any) => {
            // Get like count
            const { count: likesCount } = await adminClient
                .from('thread_likes')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', thread.id);

            // Check if user liked
            let userHasLiked = false;
            if (currentUserId) {
                const { data: like } = await adminClient
                    .from('thread_likes')
                    .select('user_id')
                    .eq('thread_id', thread.id)
                    .eq('user_id', currentUserId)
                    .single();
                userHasLiked = !!like;
            }

            // Get reply count
            const { count: replyCount } = await adminClient
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', thread.id);

            return {
                ...thread,
                likes_count: likesCount || 0,
                user_has_liked: userHasLiked,
                reply_count: replyCount || 0
            };
        }));

        res.json(enrichedThreads);
    } catch (error: any) {
        console.log('Threads endpoint error:', error.message);
        // Return empty array for any errors to prevent blocking the app
        res.json([]);
    }
});

// GET /api/threads/:id - Get single thread with comments
router.get('/:id', async (req: Request, res: Response) => {
    const adminClient = supabase;
    const userClient = getSupabase(req.headers.authorization);
    const { id } = req.params;

    try {
        const { data: { user } } = await userClient.auth.getUser();
        const currentUserId = user?.id;

        // 1. Fetch Thread
        const { data: thread, error: threadError } = await adminClient
            .from('threads')
            .select(`
                *,
                author:profiles!threads_author_id_fkey(id, name, avatar, reputation)
            `)
            .eq('id', id)
            .single();

        if (threadError) return res.status(404).json({ error: 'Thread not found' });

        // 2. Fetch Thread Likes info
        const { count: likesCount } = await adminClient
            .from('thread_likes')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', id);

        let userHasLiked = false;
        if (currentUserId) {
            const { data: like } = await adminClient
                .from('thread_likes')
                .select('user_id')
                .eq('thread_id', id)
                .eq('user_id', currentUserId)
                .single();
            userHasLiked = !!like;
        }

        // 3. Fetch Comments
        const { data: comments, error: commentsError } = await adminClient
            .from('comments')
            .select(`
                *,
                author:profiles!comments_author_id_fkey(id, name, avatar, reputation)
            `)
            .eq('thread_id', id)
            .order('created_at', { ascending: true });

        if (commentsError) return res.status(500).json({ error: commentsError.message });

        // 4. Enrich comments with likes
        const enrichedComments = await Promise.all((comments || []).map(async (comment: any) => {
            const { count: commentLikesCount } = await adminClient
                .from('comment_likes')
                .select('*', { count: 'exact', head: true })
                .eq('comment_id', comment.id);

            let userHasLikedComment = false;
            if (currentUserId) {
                const { data: like } = await adminClient
                    .from('comment_likes')
                    .select('user_id')
                    .eq('comment_id', comment.id)
                    .eq('user_id', currentUserId)
                    .single();
                userHasLikedComment = !!like;
            }

            return {
                ...comment,
                likes_count: commentLikesCount || 0,
                user_has_liked: userHasLikedComment
            };
        }));

        res.json({
            ...thread,
            likes_count: likesCount || 0,
            user_has_liked: userHasLiked,
            replies: enrichedComments
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/threads - Create a new thread
router.post('/', async (req: Request, res: Response) => {
    const userClient = getSupabase(req.headers.authorization);
    const { author_id, title, content, category, tags, images } = req.body;

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // Verify author_id matches authenticated user
        if (author_id !== user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { data, error } = await userClient
            .from('threads')
            .insert([{ author_id, title, content, category, tags, images: images || [] }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error in thread creation endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/threads/:id/reply - Add a reply to a thread
router.post('/:id/reply', async (req: Request, res: Response) => {
    const userClient = getSupabase(req.headers.authorization);
    const adminClient = supabase;
    const { id } = req.params;
    const { author_id, content, images } = req.body;

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // Verify author_id matches authenticated user
        if (author_id !== user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Create the comment/reply
        const { data, error } = await userClient
            .from('comments')
            .insert([{
                thread_id: id,
                author_id,
                content,
                images: images || []
            }])
            .select()
            .single();

        if (error) throw error;

        // Update thread's last_active timestamp
        await userClient
            .from('threads')
            .update({ last_active: new Date().toISOString() })
            .eq('id', id);

        // Create notification for thread author if it's not their own reply
        const { data: thread } = await adminClient
            .from('threads')
            .select('author_id, title')
            .eq('id', id)
            .single();

        if (thread && thread.author_id !== author_id) {
            await adminClient
                .from('notifications')
                .insert({
                    user_id: thread.author_id,
                    type: 'comment',
                    title: 'New Reply',
                    message: `${user.user_metadata?.name || 'Someone'} replied to your thread "${thread.title}"`,
                    link: `/community/thread/${id}`
                });
        }

        res.status(201).json(data);
    } catch (error: any) {
        console.error('Error in thread reply endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});


// POST /api/threads/:id/like - Toggle like
router.post('/:id/like', async (req: Request, res: Response) => {
    const userClient = getSupabase(req.headers.authorization);
    const { id } = req.params;

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // Check if already liked
        const { data: existingLike } = await userClient
            .from('thread_likes')
            .select('*')
            .eq('thread_id', id)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // Unlike
            await userClient
                .from('thread_likes')
                .delete()
                .eq('thread_id', id)
                .eq('user_id', user.id);
            res.json({ liked: false });
        } else {
            // Like
            await userClient
                .from('thread_likes')
                .insert([{ thread_id: id, user_id: user.id }]);
            res.json({ liked: true });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/comments/:id/like - Toggle comment like
router.post('/comments/:id/like', async (req: Request, res: Response) => {
    const userClient = getSupabase(req.headers.authorization);
    const { id } = req.params;

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // Check if already liked
        const { data: existingLike } = await userClient
            .from('comment_likes')
            .select('*')
            .eq('comment_id', id)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // Unlike
            await userClient
                .from('comment_likes')
                .delete()
                .eq('comment_id', id)
                .eq('user_id', user.id);
            res.json({ liked: false });
        } else {
            // Like
            await userClient
                .from('comment_likes')
                .insert([{ comment_id: id, user_id: user.id }]);
            res.json({ liked: true });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/threads/:id/pin - Toggle pin (Admin only)
router.post('/:id/pin', async (req: Request, res: Response) => {
    const adminClient = supabase; // Use admin client to bypass RLS if needed, but we should check auth
    const userClient = getSupabase(req.headers.authorization);
    const { id } = req.params;

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

        // TODO: Check if user is admin. For now, we'll allow it for testing or check a hardcoded list/flag
        // const isAdmin = user.email?.endsWith('@akitaconnect.com');
        // if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

        // Fetch current pin status
        const { data: thread } = await adminClient
            .from('threads')
            .select('is_pinned')
            .eq('id', id)
            .single();

        if (!thread) return res.status(404).json({ error: 'Thread not found' });

        const newStatus = !thread.is_pinned;

        await adminClient
            .from('threads')
            .update({ is_pinned: newStatus })
            .eq('id', id);

        res.json({ is_pinned: newStatus });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
