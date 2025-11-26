import express, { Request, Response } from 'express';

import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import akitaRoutes from './routes/akitas';
import userRoutes from './routes/users';
import litterRoutes from './routes/litters';
import healthRoutes from './routes/health';
import threadRoutes from './routes/threads';
import postRoutes from './routes/posts';
import eventRoutes from './routes/events';
import messageRoutes from './routes/messages';
import searchRoutes from './routes/search';
import followsRoutes from './routes/follows';
import notificationsRoutes from './routes/notifications';
import marketplaceRoutes from './routes/marketplace';
import uploadsRoutes from './routes/uploads';


import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        const allowedOrigins = [clientUrl, 'http://localhost:5173', 'http://localhost:4173'];
        const isLocalhost = origin.match(/^http:\/\/localhost:\d+$/);
        const isVercel = typeof origin === 'string' && origin.endsWith('.vercel.app');

        if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost || isVercel) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(morgan('dev'));

// Routes
app.use('/api/akitas', akitaRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/litters', litterRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/conversations', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/version', (req: Request, res: Response) => {
    res.json({
        version: '1.0.6',
        timestamp: new Date().toISOString(),
        deployId: 'ts-node-final-fix'
    });
});

app.get('/', (req: Request, res: Response) => {
    console.log('DEBUG: Root endpoint hit. Version: 1.0.3');
    res.send('Akita Connect API is running (v2) - Version 1.0.3');
});

// Export app for Vercel
export default app;

// Only start server if not running in Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    server.on('error', (error: any) => {
        console.error('Server error:', error);
    });
}
