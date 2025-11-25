import { supabase } from '../db';

const runMigration = async () => {
    console.log('Running migration: Add profile fields...');

    try {
        // Execute raw SQL using Supabase's ability to call functions
        const { data, error } = await supabase.rpc('exec', {
            sql: `
                ALTER TABLE public.profiles
                ADD COLUMN IF NOT EXISTS cover_photo text,
                ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}',
                ADD COLUMN IF NOT EXISTS kennel_name text,
                ADD COLUMN IF NOT EXISTS experience_level text,
                ADD COLUMN IF NOT EXISTS years_of_experience integer DEFAULT 0,
                ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
                ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
                ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
            `
        });

        if (error) {
            console.error('Migration failed - this is expected if exec function does not exist.');
            console.error('Error:', error.message);
            console.log('\n========================================');
            console.log('Please run this SQL manually in Supabase Dashboard SQL Editor:');
            console.log('========================================\n');
            console.log(`
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_photo text,
ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kennel_name text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS years_of_experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
            `);
            console.log('\n========================================\n');
        } else {
            console.log('✅ Migration completed successfully!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
};

runMigration().catch(console.error);
