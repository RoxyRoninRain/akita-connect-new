import { supabase } from './db';

const BUCKETS = [
    { name: 'avatars', public: true },
    { name: 'akitas', public: true },
    { name: 'litters', public: true }
];

async function initStorage() {
    console.log('📦 Initializing Supabase Storage...');

    for (const bucket of BUCKETS) {
        const { data, error } = await supabase.storage.getBucket(bucket.name);

        if (error && error.message.includes('not found')) {
            console.log(`   Creating bucket: ${bucket.name}...`);
            const { error: createError } = await supabase.storage.createBucket(bucket.name, {
                public: bucket.public,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
            });

            if (createError) {
                console.error(`❌ Failed to create bucket ${bucket.name}:`, createError.message);
            } else {
                console.log(`✅ Bucket ${bucket.name} created successfully`);
            }
        } else if (error) {
            console.error(`❌ Error checking bucket ${bucket.name}:`, error.message);
        } else {
            console.log(`   Bucket ${bucket.name} already exists`);
        }
    }

    console.log('✨ Storage initialization complete');
}

initStorage().catch(console.error);
