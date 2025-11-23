
// const fetch = require('node-fetch'); // Using global fetch

const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';
const API_URL = 'http://localhost:3000/api'; // Assuming backend runs on 3000

async function testAddAkita() {
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

        if (!authResponse.ok) {
            throw new Error(`Login failed: ${JSON.stringify(authData)}`);
        }

        const token = authData.access_token;
        const userId = authData.user.id;
        console.log('Login successful. Token obtained.');

        // 2. Add Akita
        console.log('Adding Akita...');
        const akitaData = {
            call_name: "Hachiko API Test",
            registered_name: "Loyal Hachiko API",
            dob: "2020-01-01",
            gender: "male",
            color: "Red",
            bio: "Created via API test",
            owner_id: userId,
            images: [],
            titles: [],
            health_records: [],
            achievements: []
        };

        const akitaResponse = await fetch(`${API_URL}/akitas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // If backend checks auth header, or we might need to rely on RLS if hitting supabase directly. 
                // Wait, the backend endpoint /api/akitas might not expect a token if it's just a proxy or if it handles auth differently.
                // Let's check the backend implementation of POST /api/akitas.
            },
            body: JSON.stringify(akitaData)
        });

        // If the backend is just a proxy to Supabase, we might need to use the Supabase client in the backend which uses the SERVICE_ROLE key, 
        // OR if the backend validates the user.
        // Let's assume standard REST API for now.

        const akitaResult = await akitaResponse.json();

        if (akitaResponse.ok) {
            console.log('✅ Akita added successfully!');
            console.log('New Akita:', akitaResult);
        } else {
            console.error('❌ Failed to add Akita:', akitaResult);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAddAkita();
