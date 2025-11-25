import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getSupabase, supabase } from '../db';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// POST /api/uploads/avatar - Upload user avatar
router.post('/avatar', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    const userClient = getSupabase(req.headers.authorization);

    try {
        // Get current user
        const { data: { user }, error: authError } = await userClient.auth.getUser();
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
        const { data, error } = await supabase.storage
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
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/uploads/post-image - Upload post image
router.post('/post-image', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    const userClient = getSupabase(req.headers.authorization);

    try {
        // Get current user
        const { data: { user }, error: authError } = await userClient.auth.getUser();
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
        const { data, error } = await supabase.storage
            .from('posts')
            .upload(filePath, fileBuffer, {
                contentType: contentType
            });

        if (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
        console.error('Error uploading post image:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/uploads/post-image/:path - Delete post image
router.delete('/post-image/:userId/:filename', async (req: Request, res: Response): Promise<any> => {
    const userClient = getSupabase(req.headers.authorization);

    try {
        //Get current user
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId, filename } = req.params;
        const filePath = `${userId}/${filename}`;

        // Delete from storage
        const { error } = await supabase.storage
            .from('posts')
            .remove([filePath]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/uploads/thread-image - Upload thread/reply image
router.post('/thread-image', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    const userClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
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

        const { data, error } = await supabase.storage
            .from('threads')
            .upload(filePath, fileBuffer, {
                contentType: contentType
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('threads')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
        console.error('Error uploading thread image:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/uploads/message-attachment - Upload message attachment
router.post('/message-attachment', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    const userClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
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

        const { data, error } = await supabase.storage
            .from('messages')
            .upload(filePath, fileBuffer, {
                contentType: contentType
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('messages')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
        console.error('Error uploading message attachment:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/uploads/akita-image - Upload akita image
router.post('/akita-image', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    const userClient = getSupabase(req.headers.authorization);

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
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

        const { data, error } = await supabase.storage
            .from('akitas')
            .upload(filePath, fileBuffer, {
                contentType: contentType
            });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('akitas')
            .getPublicUrl(filePath);

        res.json({ url: publicUrl, path: data.path });
    } catch (error: any) {
        console.error('Error uploading akita image:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
