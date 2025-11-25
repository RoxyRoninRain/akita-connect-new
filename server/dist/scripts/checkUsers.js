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
function checkUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔍 Checking existing users in profiles table...\n');
        try {
            const { data: profiles, error } = yield db_1.supabase
                .from('profiles')
                .select('id, email, name, role')
                .order('name');
            if (error) {
                console.error('❌ Error fetching profiles:', error.message);
                return;
            }
            if (!profiles || profiles.length === 0) {
                console.log('❌ No users found in profiles table!');
                console.log('\n📝 You need to create a user account.');
                console.log('\nOptions:');
                console.log('1. Use the Sign Up page on the frontend');
                console.log('2. Create a user in Supabase Dashboard > Authentication');
                return;
            }
            console.log(`✅ Found ${profiles.length} user(s):\n`);
            profiles.forEach((profile, index) => {
                console.log(`${index + 1}. ${profile.email}`);
                console.log(`   Name: ${profile.name}`);
                console.log(`   Role: ${profile.role}`);
                console.log(`   ID: ${profile.id}\n`);
            });
            console.log('💡 Try logging in with one of these emails.');
            console.log('⚠️  Note: You must use the PASSWORD you set when creating the account.');
            console.log('   (If you don\'t remember, reset it in Supabase Dashboard > Authentication > Users)\n');
        }
        catch (err) {
            console.error('❌ Unexpected error:', err);
        }
    });
}
checkUsers();
