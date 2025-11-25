
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
        return env;
    }
    return {};
}

const env = loadEnv(path.resolve(__dirname, '.env'));
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const API_URL = env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFlow() {
    const timestamp = Date.now();
    const email = `test_${timestamp}@example.com`;
    const password = 'Password123!';
    const name = `Test User ${timestamp}`;

    console.log(`🔵 Starting test for ${email}`);
    console.log(`🔵 API URL: ${API_URL}`);

    // 1. Register via Backend
    try {
        console.log('🔵 Attempting registration via Backend...');
        const regRes = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        if (!regRes.ok) {
            const text = await regRes.text();
            console.error(`❌ Registration failed: ${regRes.status} ${text}`);
            // If backend fails, try direct Supabase signup to isolate issue
            console.log('⚠️ Backend failed, trying direct Supabase signup...');
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            console.log('✅ Direct Supabase signup successful');
        } else {
            console.log('✅ Backend registration successful');
        }
    } catch (err) {
        console.error('❌ Registration error:', err);
        // Continue to try login anyway
    }

    // 2. Login via Supabase (Frontend simulation)
    console.log('🔵 Attempting login via Supabase...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('❌ Login failed:', loginError.message);
        return;
    }
    console.log('✅ Login successful');
    const userId = loginData.user.id;

    // 3. Check Profile
    console.log('🔵 Checking for profile...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message);
        // Attempt to create it if missing (simulating frontend fix)
        console.log('⚠️ Profile missing. Attempting to create...');
        const { error: createError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                email: email,
                name: name,
                role: 'user'
            }]);

        if (createError) {
            console.error('❌ Failed to create profile manually:', createError.message);
        } else {
            console.log('✅ Profile created manually');
        }
    } else {
        console.log('✅ Profile found:', profile);
    }
}

testFlow();
