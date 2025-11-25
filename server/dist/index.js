"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const akitas_1 = __importDefault(require("./routes/akitas"));
const users_1 = __importDefault(require("./routes/users"));
const litters_1 = __importDefault(require("./routes/litters"));
const health_1 = __importDefault(require("./routes/health"));
const threads_1 = __importDefault(require("./routes/threads"));
const posts_1 = __importDefault(require("./routes/posts"));
const events_1 = __importDefault(require("./routes/events"));
const messages_1 = __importDefault(require("./routes/messages"));
const search_1 = __importDefault(require("./routes/search"));
const follows_1 = __importDefault(require("./routes/follows"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const marketplace_1 = __importDefault(require("./routes/marketplace"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Check if origin is allowed
        const allowedOrigins = [clientUrl, 'http://localhost:5173', 'http://localhost:4173'];
        const isLocalhost = origin.match(/^http:\/\/localhost:\d+$/);
        const isVercel = typeof origin === 'string' && origin.endsWith('.vercel.app');
        if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost || isVercel) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' })); // Increase limit for base64 images
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/akitas', akitas_1.default);
app.use('/api/health', health_1.default);
app.use('/api/users', users_1.default);
app.use('/api/litters', litters_1.default);
app.use('/api/threads', threads_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/events', events_1.default);
app.use('/api/conversations', messages_1.default);
app.use('/api/search', search_1.default);
app.use('/api/follows', follows_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/marketplace', marketplace_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/auth', auth_1.default);
app.get('/api/version', (req, res) => {
    res.json({
        version: '1.0.2',
        timestamp: new Date().toISOString(),
        deployId: 'native-clean-fix'
    });
});
app.get('/', (req, res) => {
    console.log('DEBUG: Root endpoint hit. Version: 1.0.2');
    res.send('Akita Connect API is running (v2) - Version 1.0.2');
});
// Export app for Vercel
exports.default = app;
// Only start server if not running in Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
    });
    server.on('error', (error) => {
        console.error('Server error:', error);
    });
}
