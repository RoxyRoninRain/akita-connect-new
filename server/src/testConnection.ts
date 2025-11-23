import { supabase } from './db';

const testConnection = async () => {
    console.log('🔍 Testing Supabase Connection...\n');

    // Test 1: Check if client is initialized
    console.log('1️⃣ Checking Supabase client initialization...');
    if (!supabase) {
        console.error('❌ Supabase client is not initialized');
        return;
    }
    console.log('✅ Supabase client initialized\n');

    // Test 2: Test database connection by reading from profiles table
    console.log('2️⃣ Testing database connection (reading profiles)...');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);

        if (error) {
            console.error('❌ Error reading from profiles table:', error.message);
            console.error('   Details:', error);
        } else {
            console.log(`✅ Successfully read from profiles table (${data?.length || 0} rows)`);
            if (data && data.length > 0) {
                console.log('   First profile:', data[0].name || data[0].email);
            }
        }
    } catch (err) {
        console.error('❌ Exception while reading profiles:', err);
    }
    console.log('');

    // Test 3: Test reading from akitas table
    console.log('3️⃣ Testing database connection (reading akitas)...');
    try {
        const { data, error } = await supabase
            .from('akitas')
            .select('*')
            .limit(5);

        if (error) {
            console.error('❌ Error reading from akitas table:', error.message);
            console.error('   Details:', error);
        } else {
            console.log(`✅ Successfully read from akitas table (${data?.length || 0} rows)`);
            if (data && data.length > 0) {
                console.log('   First akita:', data[0].call_name);
            }
        }
    } catch (err) {
        console.error('❌ Exception while reading akitas:', err);
    }
    console.log('');

    // Test 4: Test auth status
    console.log('4️⃣ Testing auth session...');
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ Error getting session:', error.message);
        } else if (session) {
            console.log('✅ Active session found');
            console.log('   User:', session.user.email);
        } else {
            console.log('ℹ️  No active session (not logged in)');
        }
    } catch (err) {
        console.error('❌ Exception while checking auth:', err);
    }
    console.log('');

    // Test 5: Test insert capability (with rollback)
    console.log('5️⃣ Testing insert capability...');
    try {
        const testProfile = {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'test@example.com',
            name: 'Test User'
        };

        const { error: insertError } = await supabase
            .from('profiles')
            .insert([testProfile]);

        if (insertError) {
            // This is expected if RLS policies require authentication
            if (insertError.message.includes('new row violates row-level security policy') ||
                insertError.message.includes('violates foreign key constraint')) {
                console.log('ℹ️  Insert blocked by RLS policies (expected for unauthenticated)');
            } else {
                console.error('❌ Insert error:', insertError.message);
            }
        } else {
            console.log('✅ Insert succeeded (cleaning up...)');
            // Clean up test data
            await supabase
                .from('profiles')
                .delete()
                .eq('id', testProfile.id);
        }
    } catch (err) {
        console.error('❌ Exception during insert test:', err);
    }
    console.log('');

    console.log('✨ Connection test complete!\n');
};

testConnection().catch((err) => {
    console.error('💥 Fatal error during connection test:', err);
    process.exit(1);
});
