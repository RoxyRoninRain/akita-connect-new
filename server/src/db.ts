import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase credentials in .env file');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);

export const getSupabase = (authHeader?: string) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No auth header or invalid format, use service role key
        return supabase;
    }

    try {
        // Create client with user's auth token for RLS
        return createClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseKey || 'placeholder',
            {
                global: {
                    headers: { Authorization: authHeader }
                }
            }
        );
    } catch (error) {
        console.error('Error creating authenticated Supabase client:', error);
        return supabase;
    }
};
