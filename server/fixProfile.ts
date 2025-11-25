import { supabase } from '../server/src/db';

async function checkAndFixProfile() {
    // Get the email you're trying to log in with
    const email = 'YOUR_EMAIL_HERE'; // Replace with your actual email

    console.log('Checking auth user...');

    // Get all auth users (admin only)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing users:', authError);
        return;
    }

    const user = authUsers.users.find(u => u.email === email);

    if (!user) {
        console.log('❌ No auth user found with that email');
        return;
    }

    console.log('✅ Auth user found:', user.id);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        return;
    }

    if (!profile) {
        console.log('❌ Profile missing, creating it...');

        // Create the missing profile
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || 'User',
                avatar: user.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${user.email}&background=random`,
                role: 'enthusiast'
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating profile:', createError);
            return;
        }

        console.log('✅ Profile created:', newProfile);
    } else {
        console.log('✅ Profile exists:', profile);
    }
}

checkAndFixProfile().then(() => {
    console.log('Done!');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
