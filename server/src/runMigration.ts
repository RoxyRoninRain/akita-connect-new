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

const run = async () => {
    console.log('Running migration...');
    const sqlPath = path.join(__dirname, 'sql', '02_social_features.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ Migration failed:', error);
        console.log('If the error is "function exec_sql does not exist", you MUST run the SQL manually in the Supabase Dashboard.');
    } else {
        console.log('✅ Migration successful!');
    }
};

run();
