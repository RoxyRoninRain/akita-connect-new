
// const fetch = require('node-fetch'); // Using global fetch

const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';
const API_URL = 'http://localhost:3000/api';

async function testAddLitter() {
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

        // 2. Update User to Breeder
        console.log('Updating user to breeder...');
        const userUpdateResponse = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                id: userId,
                email: 'testuser@example.com',
                role: 'breeder',
                name: 'Test Breeder',
                // other required fields if any, but upsert should handle partials if RLS allows
            })
        });

        if (!userUpdateResponse.ok) {
            const err = await userUpdateResponse.json();
            console.error('Failed to update user:', err);
            // Proceeding anyway as user might already be breeder
        } else {
            console.log('User updated to breeder.');
        }

        // 3. Create Sire
        console.log('Creating Sire...');
        const sireResponse = await fetch(`${API_URL}/akitas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                call_name: "Test Sire",
                registered_name: "Test Sire Registered",
                dob: "2019-01-01",
                gender: "male",
                color: "Red",
                owner_id: userId
            })
        });
        const sire = await sireResponse.json();
        if (!sireResponse.ok) throw new Error(`Failed to create sire: ${JSON.stringify(sire)}`);
        console.log('Sire created:', sire.id);

        // 4. Create Dam
        console.log('Creating Dam...');
        const damResponse = await fetch(`${API_URL}/akitas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                call_name: "Test Dam",
                registered_name: "Test Dam Registered",
                dob: "2019-01-01",
                gender: "female",
                color: "White",
                owner_id: userId
            })
        });
        const dam = await damResponse.json();
        if (!damResponse.ok) throw new Error(`Failed to create dam: ${JSON.stringify(dam)}`);
        console.log('Dam created:', dam.id);

        // 5. Create Litter
        console.log('Creating Litter...');
        const litterResponse = await fetch(`${API_URL}/litters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                breeder_id: userId,
                sire_id: sire.id,
                dam_id: dam.id,
                dob: "2023-01-01",
                status: "Available",
                price: 2000,
                description: "Test Litter via API",
                location: "Test Location"
            })
        });

        const litter = await litterResponse.json();
        if (litterResponse.ok) {
            console.log('✅ Litter created successfully!');
            console.log('New Litter:', litter);
        } else {
            console.error('❌ Failed to create litter:', litter);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAddLitter();
