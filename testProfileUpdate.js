
const VITE_API_URL = 'http://localhost:3000';
const API_URL = (VITE_API_URL || 'http://localhost:3001') + '/api';

async function testProfileUpdate() {
    const email = `update_test_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Update Tester';

    console.log(`--- Testing Profile Update (User: ${email}) ---`);

    try {
        // 1. Register to get token
        console.log('1. Registering...');
        const regResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        if (!regResponse.ok) throw new Error('Registration failed');
        const { user, session } = await regResponse.json();
        const token = session.access_token;
        console.log('✅ Registered. Token obtained.');

        // 2. Update Profile
        console.log('2. Updating profile...');
        const newName = 'Updated Name ' + Date.now();
        const updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Pass token!
            },
            body: JSON.stringify({ name: newName })
        });

        if (!updateResponse.ok) {
            const text = await updateResponse.text();
            throw new Error(`Update failed: ${updateResponse.status} ${text}`);
        }

        const updatedProfile = await updateResponse.json();
        console.log('✅ Update successful');

        if (updatedProfile.name === newName) {
            console.log('✅ Name matches updated value');
        } else {
            console.error('❌ Name mismatch:', updatedProfile.name);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testProfileUpdate();
