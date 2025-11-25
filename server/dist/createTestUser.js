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
function createTestUser() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log('Creating second test user...');
        // Create auth user
        const { data: authData, error: authError } = yield db_1.supabase.auth.signUp({
            email: 'testuser2@example.com',
            password: 'testpassword123'
        });
        if (authError) {
            console.error('Auth error:', authError);
            return;
        }
        console.log('✅ Auth user created:', (_a = authData.user) === null || _a === void 0 ? void 0 : _a.id);
        // Create profile
        const { data: profileData, error: profileError } = yield db_1.supabase
            .from('profiles')
            .insert([{
                id: (_b = authData.user) === null || _b === void 0 ? void 0 : _b.id,
                email: 'testuser2@example.com',
                name: 'Test User 2',
                avatar: 'https://ui-avatars.com/api/?name=Test+User+2&background=random'
            }])
            .select()
            .single();
        if (profileError) {
            console.error('Profile error:', profileError);
            return;
        }
        console.log('✅ Profile created:', profileData);
        console.log('\nTest user credentials:');
        console.log('Email: testuser2@example.com');
        console.log('Password: testpassword123');
    });
}
createTestUser().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
