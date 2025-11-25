
const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';

async function createProfile() {
    const userId = '6e5f3df7-ffbd-4ff2-afbd-fe4f539f5cfd'; // ID from testRegister.js output
    const email = 'testuser_1764039437596@example.com';

    console.log(`Creating profile for user: ${userId}`);

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`, // Using anon key, might need service role if RLS blocks. 
                // Actually, RLS says "Users can insert their own profile" with check (auth.uid() = id).
                // Since I'm not authenticated as the user here (using anon key without user token), this MIGHT fail if I don't use the user's token.
                // Let's try to login first to get the token, then insert.
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                id: userId,
                email: email,
                name: 'Test User',
                role: 'user'
            })
        });

        // Wait, if I use anon key without auth token, auth.uid() is null.
        // I should probably use the token from login.
        // But for simplicity, let's see if I can just use the service key? I don't have it.
        // I have to login again to get the token.
    } catch (error) {
        console.error(error);
    }
}

// Better approach: Login then Insert.
async function loginAndCreateProfile() {
    try {
        // 1. Login
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'testuser_1764039437596@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) throw new Error('Login failed');

        const token = loginData.access_token;
        const userId = loginData.user.id;

        console.log('Logged in. Token obtained.');

        // 2. Insert Profile
        const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                id: userId,
                email: 'testuser_1764039437596@example.com',
                name: 'Test User',
                role: 'user'
            })
        });

        if (profileResponse.ok) {
            console.log('✅ Profile created successfully!');
            const profileData = await profileResponse.json();
            console.log(profileData);
        } else {
            const errorData = await profileResponse.json();
            console.error('❌ Profile creation failed:', errorData);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

loginAndCreateProfile();
