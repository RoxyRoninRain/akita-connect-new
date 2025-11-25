
const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';

async function deleteProfile() {
    const userId = '6e5f3df7-ffbd-4ff2-afbd-fe4f539f5cfd'; // ID from testRegister.js output

    console.log(`Deleting profile for user: ${userId}`);

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`, // Using anon key, might need service role if RLS blocks.
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('✅ Profile deleted successfully (or not found)');
        } else {
            console.error('❌ Profile deletion failed:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

deleteProfile();
