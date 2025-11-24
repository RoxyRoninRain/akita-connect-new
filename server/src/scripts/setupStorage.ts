import { supabase } from '../db';

async function setupStorage() {
    console.log('🚀 Setting up Supabase Storage buckets...\n');

    const bucketsConfig = [
        {
            name: 'avatars',
            description: 'User profile pictures',
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        },
        {
            name: 'posts',
            description: 'Feed post images',
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        },
        {
            name: 'threads',
            description: 'Forum thread and reply images',
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        },
        {
            name: 'messages',
            description: 'Message attachment images',
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf']
        },
        {
            name: 'akitas',
            description: 'Akita profile images',
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        }
    ];

    try {
        for (const config of bucketsConfig) {
            console.log(`Creating "${config.name}" bucket (${config.description})...`);

            const { data, error } = await supabase.storage.createBucket(config.name, {
                public: true,
                fileSizeLimit: config.fileSizeLimit,
                allowedMimeTypes: config.allowedMimeTypes
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    console.log(`✓ "${config.name}" bucket already exists`);
                } else {
                    console.error(`✗ Error creating ${config.name} bucket:`, error.message);
                }
            } else {
                console.log(`✓ "${config.name}" bucket created successfully`);
            }
        }

        // List all buckets to confirm
        console.log('\n📦 Storage buckets overview:');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('✗ Error listing buckets:', listError.message);
        } else {
            buckets?.forEach(bucket => {
                const config = bucketsConfig.find(c => c.name === bucket.name);
                const sizeLimit = config ? `${(config.fileSizeLimit / 1048576).toFixed(0)}MB` : 'N/A';
                console.log(`  - ${bucket.name.padEnd(15)} (${bucket.public ? 'public ' : 'private'}, max: ${sizeLimit}) - ${config?.description || 'Unknown'}`);
            });
        }

        console.log('\n✅ Storage setup complete!');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setupStorage();
