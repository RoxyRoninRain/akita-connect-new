const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkThreadsTable() {
    console.log('Checking threads table schema...');

    try {
        // Try to select images column
        const { data, error } = await supabase
            .from('threads')
            .select('images')
            .limit(1);

        if (error && error.message.includes('column "images" does not exist')) {
            console.log('❌ Images column does not exist in threads table\n');
            console.log('Please run this SQL in your Supabase SQL Editor:');
            console.log('https://supabase.com/dashboard/project/yxlxgmrkzljqdehubxza/sql\n');
            console.log('---SQL START---');
            console.log(`
ALTER TABLE threads
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

COMMENT ON COLUMN threads.images IS 'Array of image URLs attached to the thread';
COMMENT ON COLUMN comments.images IS 'Array of image URLs attached to the reply/comment';
            `.trim());
            console.log('---SQL END---\n');
            process.exit(0);
        } else if (error) {
            console.error('Error:', error);
            process.exit(1);
        } else {
            console.log('✅ Images column exists in threads table!');
            process.exit(0);
        }
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkThreadsTable();
