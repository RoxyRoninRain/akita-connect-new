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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
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

app.get('/', (req: Request, res: Response) => {
    res.send('Akita Connect API is running');
});

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
