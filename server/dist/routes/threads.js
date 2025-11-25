"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/threads - List all threads
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const adminClient = db_1.supabase; // Use admin for complex joins if needed, or just standard client
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    try {
        // Get current user for "has_liked" check
        const { data: { user } } = yield userClient.auth.getUser();
        const currentUserId = user === null || user === void 0 ? void 0 : user.id;
        // Fetch threads with author and counts
        // Note: Supabase .select() with count is tricky for nested relations in one go without foreign keys set up perfectly for it.
        // We'll fetch threads first, then enrich.
        const { data: threads, error } = yield adminClient
            .from('threads')
            .select(`
                *,
                author:profiles!threads_author_id_fkey(id, name, avatar)
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
        const enrichedThreads = yield Promise.all(threads.map((thread) => __awaiter(void 0, void 0, void 0, function* () {
            // Get like count
            const { count: likesCount } = yield adminClient
                .from('thread_likes')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', thread.id);
            // Check if user liked
            let userHasLiked = false;
            if (currentUserId) {
                const { data: like } = yield adminClient
                    .from('thread_likes')
                    .select('user_id')
                    .eq('thread_id', thread.id)
                    .eq('user_id', currentUserId)
                    .single();
                userHasLiked = !!like;
            }
            // Get reply count
            const { count: replyCount } = yield adminClient
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', thread.id);
            return Object.assign(Object.assign({}, thread), { likes_count: likesCount || 0, user_has_liked: userHasLiked, reply_count: replyCount || 0 });
        })));
        res.json(enrichedThreads);
    }
    catch (error) {
        console.log('Threads endpoint error:', error.message);
        // Return empty array for any errors to prevent blocking the app
        res.json([]);
    }
}));
// GET /api/threads/:id - Get single thread with comments
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminClient = db_1.supabase;
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { id } = req.params;
    try {
        const { data: { user } } = yield userClient.auth.getUser();
        const currentUserId = user === null || user === void 0 ? void 0 : user.id;
        // 1. Fetch Thread
        const { data: thread, error: threadError } = yield adminClient
            .from('threads')
            .select(`
                *,
                author:profiles!threads_author_id_fkey(id, name, avatar)
            `)
            .eq('id', id)
            .single();
        if (threadError)
            return res.status(404).json({ error: 'Thread not found' });
        // 2. Fetch Thread Likes info
        const { count: likesCount } = yield adminClient
            .from('thread_likes')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', id);
        let userHasLiked = false;
        if (currentUserId) {
            const { data: like } = yield adminClient
                .from('thread_likes')
                .select('user_id')
                .eq('thread_id', id)
                .eq('user_id', currentUserId)
                .single();
            userHasLiked = !!like;
        }
        // 3. Fetch Comments
        const { data: comments, error: commentsError } = yield adminClient
            .from('comments')
            .select(`
                *,
                author:profiles!comments_author_id_fkey(id, name, avatar, reputation)
            `)
            .eq('thread_id', id)
            .order('created_at', { ascending: true });
        if (commentsError)
            return res.status(500).json({ error: commentsError.message });
        // 4. Enrich comments with likes
        const enrichedComments = yield Promise.all((comments || []).map((comment) => __awaiter(void 0, void 0, void 0, function* () {
            const { count: commentLikesCount } = yield adminClient
                .from('comment_likes')
                .select('*', { count: 'exact', head: true })
                .eq('comment_id', comment.id);
            let userHasLikedComment = false;
            if (currentUserId) {
                const { data: like } = yield adminClient
                    .from('comment_likes')
                    .select('user_id')
                    .eq('comment_id', comment.id)
                    .eq('user_id', currentUserId)
                    .single();
                userHasLikedComment = !!like;
            }
            return Object.assign(Object.assign({}, comment), { likes_count: commentLikesCount || 0, user_has_liked: userHasLikedComment });
        })));
        res.json(Object.assign(Object.assign({}, thread), { likes_count: likesCount || 0, user_has_liked: userHasLiked, replies: enrichedComments }));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/threads - Create a new thread
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { author_id, title, content, category, tags, images } = req.body;
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user)
            return res.status(401).json({ error: 'Unauthorized' });
        // Verify author_id matches authenticated user
        if (author_id !== user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { data, error } = yield userClient
            .from('threads')
            .insert([{ author_id, title, content, category, tags, images: images || [] }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Error in thread creation endpoint:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/threads/:id/reply - Add a reply to a thread
router.post('/:id/reply', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const adminClient = db_1.supabase;
    const { id } = req.params;
    const { author_id, content, images } = req.body;
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user)
            return res.status(401).json({ error: 'Unauthorized' });
        // Verify author_id matches authenticated user
        if (author_id !== user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Create the comment/reply
        const { data, error } = yield userClient
            .from('comments')
            .insert([{
                thread_id: id,
                author_id,
                content,
                images: images || []
            }])
            .select()
            .single();
        if (error)
            throw error;
        // Update thread's last_active timestamp
        yield userClient
            .from('threads')
            .update({ last_active: new Date().toISOString() })
            .eq('id', id);
        // Create notification for thread author if it's not their own reply
        const { data: thread } = yield adminClient
            .from('threads')
            .select('author_id, title')
            .eq('id', id)
            .single();
        if (thread && thread.author_id !== author_id) {
            yield adminClient
                .from('notifications')
                .insert({
                user_id: thread.author_id,
                type: 'comment',
                title: 'New Reply',
                message: `${((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.name) || 'Someone'} replied to your thread "${thread.title}"`,
                link: `/community/thread/${id}`
            });
        }
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Error in thread reply endpoint:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/threads/:id/like - Toggle like
router.post('/:id/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { id } = req.params;
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user)
            return res.status(401).json({ error: 'Unauthorized' });
        // Check if already liked
        const { data: existingLike } = yield userClient
            .from('thread_likes')
            .select('*')
            .eq('thread_id', id)
            .eq('user_id', user.id)
            .single();
        if (existingLike) {
            // Unlike
            yield userClient
                .from('thread_likes')
                .delete()
                .eq('thread_id', id)
                .eq('user_id', user.id);
            res.json({ liked: false });
        }
        else {
            // Like
            yield userClient
                .from('thread_likes')
                .insert([{ thread_id: id, user_id: user.id }]);
            res.json({ liked: true });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/comments/:id/like - Toggle comment like
router.post('/comments/:id/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { id } = req.params;
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user)
            return res.status(401).json({ error: 'Unauthorized' });
        // Check if already liked
        const { data: existingLike } = yield userClient
            .from('comment_likes')
            .select('*')
            .eq('comment_id', id)
            .eq('user_id', user.id)
            .single();
        if (existingLike) {
            // Unlike
            yield userClient
                .from('comment_likes')
                .delete()
                .eq('comment_id', id)
                .eq('user_id', user.id);
            res.json({ liked: false });
        }
        else {
            // Like
            yield userClient
                .from('comment_likes')
                .insert([{ comment_id: id, user_id: user.id }]);
            res.json({ liked: true });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/threads/:id/pin - Toggle pin (Admin only)
router.post('/:id/pin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminClient = db_1.supabase; // Use admin client to bypass RLS if needed, but we should check auth
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { id } = req.params;
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user)
            return res.status(401).json({ error: 'Unauthorized' });
        // TODO: Check if user is admin. For now, we'll allow it for testing or check a hardcoded list/flag
        // const isAdmin = user.email?.endsWith('@akitaconnect.com');
        // if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        // Fetch current pin status
        const { data: thread } = yield adminClient
            .from('threads')
            .select('is_pinned')
            .eq('id', id)
            .single();
        if (!thread)
            return res.status(404).json({ error: 'Thread not found' });
        const newStatus = !thread.is_pinned;
        yield adminClient
            .from('threads')
            .update({ is_pinned: newStatus })
            .eq('id', id);
        res.json({ is_pinned: newStatus });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
