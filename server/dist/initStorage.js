"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const BUCKETS = [
    { name: 'avatars', public: true },
    { name: 'akitas', public: true },
    { name: 'litters', public: true }
];
function initStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📦 Initializing Supabase Storage...');
        for (const bucket of BUCKETS) {
            const { data, error } = yield db_1.supabase.storage.getBucket(bucket.name);
            if (error && error.message.includes('not found')) {
                console.log(`   Creating bucket: ${bucket.name}...`);
                const { error: createError } = yield db_1.supabase.storage.createBucket(bucket.name, {
                    public: bucket.public,
                    fileSizeLimit: 5242880, // 5MB
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
                });
                if (createError) {
                    console.error(`❌ Failed to create bucket ${bucket.name}:`, createError.message);
                }
                else {
                    console.log(`✅ Bucket ${bucket.name} created successfully`);
                }
            }
            else if (error) {
                console.error(`❌ Error checking bucket ${bucket.name}:`, error.message);
            }
            else {
                console.log(`   Bucket ${bucket.name} already exists`);
            }
        }
        console.log('✨ Storage initialization complete');
    });
}
initStorage().catch(console.error);
