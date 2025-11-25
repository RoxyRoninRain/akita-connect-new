
const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';

async function testBackendRegister() {
    const email = `backend_test_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Backend Tester';

    console.log(`--- Testing Backend Registration (User: ${email}) ---`);

    try {
        // 1. Call Backend API
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Registration failed: ${response.status} ${text}`);
        }

        const data = await response.json();
        console.log('✅ Registration successful');
        console.log('User ID:', data.user.id);

        // 2. Verify profile creation via Supabase API
        if (data.session) {
            const token = data.session.access_token;
            const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`
                }
            });
            const profiles = await profileRes.json();

            if (profiles.length > 0) {
                const profile = profiles[0];
                console.log('✅ Profile found:', profile);
                if (profile.avatar && profile.avatar.includes('ui-avatars.com')) {
                    console.log('✅ Avatar is correct:', profile.avatar);
                } else {
                    console.error('❌ Avatar mismatch:', profile.avatar);
                }
                if (profile.name === name) {
                    console.log('✅ Name is correct:', profile.name);
                } else {
                    console.error('❌ Name mismatch:', profile.name);
                }
            } else {
                console.error('❌ Profile NOT found via API');
            }
        } else {
            console.log('⚠️ No session returned, cannot verify profile via API.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testBackendRegister();
