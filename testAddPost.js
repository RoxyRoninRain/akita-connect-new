
// const fetch = require('node-fetch'); // Using global fetch

const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';
const API_URL = 'http://localhost:3000/api';

async function testAddPost() {
    try {
        // 1. Login
        console.log('Logging in...');
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'password123'
            })
        });

        const authData = await authResponse.json();
        if (!authResponse.ok) throw new Error(`Login failed: ${JSON.stringify(authData)}`);

        const token = authData.access_token;
        const userId = authData.user.id;
        console.log('Login successful.');

        // 2. Create Post
        console.log('Creating Post...');
        // Need to check the endpoint for posts. Assuming POST /api/posts
        // But wait, the server/src/index.ts didn't show a posts route!
        // Let's check server/src/index.ts again.
    } catch (error) {
        console.error('Error:', error);
    }
}
// testAddPost();
