import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOldProfile() {
    const userId = '932a6268-d363-4a47-8c00-a184b063a1e7';
    const email = 'trae267@gmail.com';

    console.log(`🔧 Creating profile for user: ${email}`);

    // Check if profile already exists
    const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existing) {
        console.log('✅ Profile already exists:', existing);
        return;
    }

    // Create the profile
    const { data, error } = await supabase
        .from('profiles')
        .insert([
            {
                id: userId,
                email: email,
                name: email.split('@')[0], // Use email prefix as default name
                avatar: null,
                role: 'user',
                location: null,
                bio: null,
                website: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
    }

    console.log('✅ Profile created successfully:', data);
}

fixOldProfile()
    .then(() => {
        console.log('✅ Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
