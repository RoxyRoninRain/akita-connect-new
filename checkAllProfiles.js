
const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';

async function checkProfiles() {
    console.log('--- Checking All Profiles ---');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
        }

        const profiles = await response.json();
        profiles.forEach((p, index) => {
            console.log(`[${index + 1}] ID: ${p.id}`);
            console.log(`  Email: ${p.email}`);
            console.log(`  Name: ${p.name}`);
            console.log(`  Avatar: ${p.avatar}`);
            console.log(`  Role: ${p.role}`);
            console.log(`  Joined: ${p.joined_date}`);
            console.log('-----------------------------------');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProfiles();
