const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    console.log('Adding attachments column to messages table...');

    try {
        // Check if column exists first by querying the table
        const { data: testData, error: testError } = await supabase
            .from('messages')
            .select('attachments')
            .limit(1);

        if (testError && testError.message.includes('column messages.attachments does not exist')) {
            console.log('❌ Attachments column does not exist - migration needed\n');
            console.log('Please run this SQL in your Supabase SQL Editor:');
            console.log('https://supabase.com/dashboard/project/yxlxgmrkzljqdehubxza/sql\n');
            console.log('---SQL START---');
            console.log(`
ALTER TABLE messages
ADD COLUMN attachments TEXT[] DEFAULT '{}';

COMMENT ON COLUMN messages.attachments IS 'Array of image URLs attached to the message';
            `.trim());
            console.log('---SQL END---\n');
            process.exit(0);
        } else if (testError) {
            console.error('Error:', testError);
            process.exit(1);
        } else {
            console.log('✅ Attachments column already exists!');
            process.exit(0);
        }
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

runMigration();
