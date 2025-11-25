
async function verifyFrontendFetch() {
    // Simulate the logic in client.ts
    const VITE_API_URL = 'http://localhost:3000';
    const API_URL = (VITE_API_URL || 'http://localhost:3001') + '/api';

    console.log('configured API_URL:', API_URL);

    // Use the ID from the previous successful test
    const userId = '826e19a5-74ed-4434-a678-b5a9a2f65948';

    console.log(`--- Verifying Frontend Fetch (User ID: ${userId}) ---`);

    try {
        const url = `${API_URL}/users/${userId}`;
        console.log('Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Fetch successful');
        console.log('User Data:', data);

        if (data.name === 'Backend Tester') {
            console.log('✅ Name matches expected value');
        } else {
            console.error('❌ Name mismatch:', data.name);
        }

    } catch (error) {
        console.error('❌ Fetch failed:', error);
    }
}

verifyFrontendFetch();
