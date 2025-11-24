import { supabase } from './db';

async function createTestUser() {
    console.log('Creating second test user...');

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'testuser2@example.com',
        password: 'testpassword123'
    });

    if (authError) {
        console.error('Auth error:', authError);
        return;
    }

    console.log('✅ Auth user created:', authData.user?.id);

    // Create profile
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
            id: authData.user?.id,
            email: 'testuser2@example.com',
            name: 'Test User 2',
            avatar: 'https://ui-avatars.com/api/?name=Test+User+2&background=random'
        }])
        .select()
        .single();

    if (profileError) {
        console.error('Profile error:', profileError);
        return;
    }

    console.log('✅ Profile created:', profileData);
    console.log('\nTest user credentials:');
    console.log('Email: testuser2@example.com');
    console.log('Password: testpassword123');
}

createTestUser().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
