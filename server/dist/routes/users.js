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
console.log('Loading users.ts route file...');
// GET /api/users - List all users (public profiles)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    const { data, error } = yield supabase
        .from('profiles')
        .select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
}));
// GET /api/users/:id - Get single user
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    const { data, error } = yield supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
    if (error) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(data);
}));
// POST /api/users - Create/Update user profile
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    const { data, error } = yield supabase
        .from('profiles')
        .upsert([userData])
        .select()
        .single();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
}));
// PUT /api/users/:id - Update user profile
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const updates = req.body;
        // 1. Verify User Identity
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Missing authorization token' });
        }
        // Use a fresh client to verify the token
        const authClient = (0, db_1.getSupabase)(req.headers.authorization);
        const { data: { user }, error: authError } = yield authClient.auth.getUser(token);
        if (authError || !user) {
            console.error('Auth Error:', authError);
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (user.id !== id) {
            console.error(`User mismatch: Token ${user.id} !== Target ${id}`);
            return res.status(403).json({ error: 'Unauthorized to update this profile' });
        }
        // 2. Perform Update using Admin Client (Bypass RLS)
        const { data, error } = yield db_1.supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) {
            console.error('Update Error:', error);
            return res.status(500).json({ error: error.message });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(data[0]);
    }
    catch (err) {
        console.error('Handler Exception:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
