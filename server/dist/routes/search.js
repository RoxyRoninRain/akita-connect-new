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
// Search across users, akitas, posts, and threads
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }
        const searchTerm = q.toLowerCase();
        // Search users
        const { data: users, error: usersError } = yield db_1.supabase
            .from('profiles')
            .select('id, name, kennel_name, avatar, location, role')
            .or(`name.ilike.%${searchTerm}%,kennel_name.ilike.%${searchTerm}%`)
            .limit(5);
        if (usersError)
            throw usersError;
        // Search akitas
        const { data: akitas, error: akitasError } = yield db_1.supabase
            .from('akitas')
            .select('id, registered_name, call_name, color, images, owner_id, titles')
            .or(`registered_name.ilike.%${searchTerm}%,call_name.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%`)
            .limit(10);
        if (akitasError)
            throw akitasError;
        // Search posts
        const { data: posts, error: postsError } = yield db_1.supabase
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
        if (postsError)
            throw postsError;
        // Search threads
        const { data: threads, error: threadsError } = yield db_1.supabase
            .from('threads')
            .select(`
                id,
                title,
                content,
                category,
                tags,
                created_at,
                author_id,
                profiles (name, avatar)
            `)
            .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false })
            .limit(5);
        if (threadsError)
            throw threadsError;
        // Transform posts to include author info at top level
        const transformedPosts = (posts === null || posts === void 0 ? void 0 : posts.map((post) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, post), { author_name: (_a = post.profiles) === null || _a === void 0 ? void 0 : _a.name, author_avatar: (_b = post.profiles) === null || _b === void 0 ? void 0 : _b.avatar }));
        })) || [];
        // Transform threads to include author info
        const transformedThreads = (threads === null || threads === void 0 ? void 0 : threads.map((thread) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, thread), { author_name: (_a = thread.profiles) === null || _a === void 0 ? void 0 : _a.name, author_avatar: (_b = thread.profiles) === null || _b === void 0 ? void 0 : _b.avatar }));
        })) || [];
        res.json({
            users: users || [],
            akitas: akitas || [],
            posts: transformedPosts,
            threads: transformedThreads
        });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
