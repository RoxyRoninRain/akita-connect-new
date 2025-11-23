import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

    console.error('❌ Supabase Configuration Error');
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    console.error('Please ensure your .env file contains:');
    console.error('  VITE_SUPABASE_URL=your_supabase_url');
    console.error('  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');

    throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}`);
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Log connection status in development
if (import.meta.env.DEV) {
    console.log('✅ Supabase client initialized');
    console.log('   URL:', supabaseUrl);

    // Test connection on initialization
    supabase.from('profiles').select('count', { count: 'exact', head: true })
        .then(({ error }) => {
            if (error) {
                console.warn('⚠️  Supabase connection test failed:', error.message);
            } else {
                console.log('✅ Supabase connection verified');
            }
        });
}
