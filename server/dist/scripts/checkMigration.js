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
const db_1 = require("../db");
function runMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔄 Checking if migration is needed...\n');
        try {
            // Test if the cover_photo column exists
            const { data, error } = yield db_1.supabase
                .from('profiles')
                .select('cover_photo')
                .limit(1);
            if (error) {
                if (error.message.includes('column') && error.message.includes('does not exist')) {
                    console.log('❌ Migration needed! The cover_photo column does not exist.\n');
                    console.log('📋 Please run this SQL in your Supabase Dashboard SQL Editor:\n');
                    console.log('========================================');
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
                    console.log('========================================\n');
                    console.log('⚠️  You must run this migration before the app will work correctly!');
                    process.exit(1);
                }
                else {
                    console.log('❌ Unexpected error:', error.message);
                    process.exit(1);
                }
            }
            else {
                console.log('✅ Migration already applied! All columns exist.');
                process.exit(0);
            }
        }
        catch (err) {
            console.error('❌ Error checking migration status:', err);
            process.exit(1);
        }
    });
}
runMigration();
