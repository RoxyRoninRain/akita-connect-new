
// const fetch = require('node-fetch'); // Using global fetch

const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';

async function login() {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
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

        const data = await response.json();

        if (response.ok) {
            console.log('Login Successful!');
            console.log('User ID:', data.user.id);
            console.log('Access Token:', data.access_token ? 'Present' : 'Missing');
        } else {
            console.error('Login Failed:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

login();
