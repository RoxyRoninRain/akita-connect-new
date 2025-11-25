import { supabase } from '../db';

async function checkUsers() {
    console.log('🔍 Checking existing users in profiles table...\n');

    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, name, role')
            .order('name');

        if (error) {
            console.error('❌ Error fetching profiles:', error.message);
            return;
        }

        if (!profiles || profiles.length === 0) {
            console.log('❌ No users found in profiles table!');
            console.log('\n📝 You need to create a user account.');
            console.log('\nOptions:');
            console.log('1. Use the Sign Up page on the frontend');
            console.log('2. Create a user in Supabase Dashboard > Authentication');
            return;
        }

        console.log(`✅ Found ${profiles.length} user(s):\n`);
        profiles.forEach((profile, index) => {
            console.log(`${index + 1}. ${profile.email}`);
            console.log(`   Name: ${profile.name}`);
            console.log(`   Role: ${profile.role}`);
            console.log(`   ID: ${profile.id}\n`);
        });

        console.log('💡 Try logging in with one of these emails.');
        console.log('⚠️  Note: You must use the PASSWORD you set when creating the account.');
        console.log('   (If you don\'t remember, reset it in Supabase Dashboard > Authentication > Users)\n');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkUsers();
