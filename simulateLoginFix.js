
const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';

async function simulateFix() {
    const email = 'testuser_1764039437596@example.com';
    const password = 'password123';

    console.log('--- Simulating StoreContext Fix ---');

    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) throw new Error('Login failed');
        console.log('✅ Login successful');
        const userId = loginData.user.id;
        const token = loginData.access_token;

        // 2. Try to fetch profile
        console.log('2. Fetching profile...');
        const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const profileData = await profileResponse.json();

        let userProfile = profileData.length > 0 ? profileData[0] : null;

        if (!userProfile) {
            console.log('⚠️ Profile not found (Expected). Simulating fix...');

            // 3. Create default profile
            const newProfile = {
                id: userId,
                email: email,
                name: email.split('@')[0],
                role: 'user',
                joined_date: new Date().toISOString()
            };

            console.log('3. Creating default profile...');
            const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(newProfile)
            });

            if (createResponse.ok) {
                console.log('✅ Default profile created successfully');
                const createData = await createResponse.json();
                userProfile = createData[0];
            } else {
                console.error('❌ Failed to create profile:', await createResponse.text());
            }
        } else {
            console.log('ℹ️ Profile already exists (Unexpected for this test, but okay)');
        }

        console.log('Final Profile State:', userProfile);

    } catch (error) {
        console.error('Error:', error);
    }
}

simulateFix();
