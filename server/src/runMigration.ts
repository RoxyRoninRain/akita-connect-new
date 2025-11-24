import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const runMigration = async () => {
    console.log('Running migration 016...');
    const migrationPath = path.join(__dirname, '../migrations/016_setup_additional_storage.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Failed to execute SQL via RPC:', error);
        console.log('Please run the migration manually in the Supabase Dashboard SQL Editor.');
    } else {
        console.log('Successfully executed migration 016!');
    }
};

runMigration();
