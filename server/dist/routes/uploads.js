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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Force redeploy with multer fix
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// POST /api/uploads/avatar - Upload user avatar
router.post('/avatar', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current user
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'File required' });
        }
        const fileBuffer = req.file.buffer;
        const fileName = req.body.fileName || req.file.originalname;
        const contentType = req.file.mimetype;
        // Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}-${fileName}`;
        const { data, error } = yield db_1.supabase.storage
            .from('avatars')
            .upload(filePath, fileBuffer, {
            contentType: contentType,
            upsert: true
        });
        if (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: error.message });
        }
        // Get public URL
        const { data: { publicUrl } } = db_1.supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl, path: data.path });
    }
    catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/uploads/post-image - Upload post image
router.post('/post-image', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current user
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'File required' });
        }
        const fileBuffer = req.file.buffer;
        const fileName = req.body.fileName || req.file.originalname;
        const contentType = req.file.mimetype;
        // Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}-${fileName}`;
        const { data, error } = yield db_1.supabase.storage
            .from('posts')
            .upload(filePath, fileBuffer, {
            contentType: contentType
        });
        if (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: error.message });
        }
        // Get public URL
        const { data: { publicUrl } } = db_1.supabase.storage
            .from('posts')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl, path: data.path });
    }
    catch (error) {
        console.error('Error uploading post image:', error);
        res.status(500).json({ error: error.message });
    }
}));
// DELETE /api/uploads/post-image/:path - Delete post image
router.delete('/post-image/:userId/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        //Get current user
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { userId, filename } = req.params;
        const filePath = `${userId}/${filename}`;
        // Delete from storage
        const { error } = yield db_1.supabase.storage
            .from('posts')
            .remove([filePath]);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/uploads/thread-image - Upload thread/reply image
router.post('/thread-image', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'File required' });
        }
        const fileBuffer = req.file.buffer;
        const fileName = req.body.fileName || req.file.originalname;
        const contentType = req.file.mimetype;
        const filePath = `${user.id}/${Date.now()}-${fileName}`;
        const { data, error } = yield db_1.supabase.storage
            .from('threads')
            .upload(filePath, fileBuffer, {
            contentType: contentType
        });
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const { data: { publicUrl } } = db_1.supabase.storage
            .from('threads')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl, path: data.path });
    }
    catch (error) {
        console.error('Error uploading thread image:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/uploads/message-attachment - Upload message attachment
router.post('/message-attachment', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'File required' });
        }
        const fileBuffer = req.file.buffer;
        const fileName = req.body.fileName || req.file.originalname;
        const contentType = req.file.mimetype;
        const filePath = `${user.id}/${Date.now()}-${fileName}`;
        const { data, error } = yield db_1.supabase.storage
            .from('messages')
            .upload(filePath, fileBuffer, {
            contentType: contentType
        });
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const { data: { publicUrl } } = db_1.supabase.storage
            .from('messages')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl, path: data.path });
    }
    catch (error) {
        console.error('Error uploading message attachment:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/uploads/akita-image - Upload akita image
router.post('/akita-image', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'File required' });
        }
        const fileBuffer = req.file.buffer;
        const fileName = req.body.fileName || req.file.originalname;
        const contentType = req.file.mimetype;
        const filePath = `${user.id}/${Date.now()}-${fileName}`;
        const { data, error } = yield db_1.supabase.storage
            .from('akitas')
            .upload(filePath, fileBuffer, {
            contentType: contentType
        });
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const { data: { publicUrl } } = db_1.supabase.storage
            .from('akitas')
            .getPublicUrl(filePath);
        res.json({ url: publicUrl, path: data.path });
    }
    catch (error) {
        console.error('Error uploading akita image:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
