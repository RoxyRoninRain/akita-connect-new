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
// Get user's notifications
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        const { data, error } = yield db_1.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Get unread count
router.get('/unread-count', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        const { count, error } = yield db_1.supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);
        if (error)
            throw error;
        res.json({ count: count || 0 });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Mark notification as read
router.put('/:id/read', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { error } = yield db_1.supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Mark all notifications as read
router.put('/read-all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        const { error } = yield db_1.supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);
        if (error)
            throw error;
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Delete notification
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { error } = yield db_1.supabase
            .from('notifications')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Create notification (for manual triggering)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, type, title, message, link } = req.body;
        if (!userId || !type || !title) {
            return res.status(400).json({ error: 'userId, type, and title are required' });
        }
        const { data, error } = yield db_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
