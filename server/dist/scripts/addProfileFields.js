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
const runMigration = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running migration: Add profile fields...');
    try {
        // Execute raw SQL using Supabase's ability to call functions
        const { data, error } = yield db_1.supabase.rpc('exec', {
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
        }
        else {
            console.log('✅ Migration completed successfully!');
        }
    }
    catch (err) {
        console.error('Unexpected error:', err);
    }
});
runMigration().catch(console.error);
