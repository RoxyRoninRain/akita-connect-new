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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const router = express_1.default.Router();
// Initialize Supabase client with available keys
// Fallback to VITE keys if server keys are missing (for local dev compatibility)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials for auth route');
}
// We use a local client here to ensure we have one even if db.ts is misconfigured
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name: providedName, avatar: providedAvatar } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        console.log('Registering user:', email);
        // 1. Create User via Supabase Auth
        const { data: authData, error: authError } = yield supabase.auth.signUp({
            email,
            password,
        });
        if (authError) {
            console.error('Supabase signUp error:', authError);
            return res.status(400).json({ error: authError.message });
        }
        if (!authData.user) {
            console.error('User creation failed: No user returned');
            return res.status(500).json({ error: 'User creation failed' });
        }
        const user = authData.user;
        const name = providedName || email.split('@')[0];
        const defaultAvatar = providedAvatar || `https://ui-avatars.com/api/?name=${name}&background=random`;
        console.log('User created:', user.id);
        // 2. Create Profile
        // If we have a session (auto-login), use it to insert profile as the user
        // If not (email confirmation), we can't insert without Service Role Key unless we have one.
        // Assuming we have a session or Service Role Key.
        let insertClient = supabase;
        if (authData.session && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            // If no service role key, use the user's token
            insertClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
                global: {
                    headers: {
                        Authorization: `Bearer ${authData.session.access_token}`
                    }
                }
            });
        }
        const { error: profileError } = yield insertClient
            .from('profiles')
            .insert([
            {
                id: user.id,
                email: user.email,
                name: name,
                avatar: defaultAvatar,
                role: 'user',
                joined_date: new Date().toISOString()
            }
        ]);
        if (profileError) {
            console.error('❌ CRITICAL: Profile creation failed for user:', user.id);
            console.error('Error details:', JSON.stringify(profileError, null, 2));
            // Attempt to cleanup user if profile creation failed?
            // Without admin key we can't delete the user easily from here if we are using session.
            // But we should definitely return a 500.
            return res.status(500).json({
                error: 'Failed to create profile. Please contact support.',
                details: profileError.message
            });
        }
        console.log('Profile created successfully');
        res.status(200).json({ user: authData.user, session: authData.session });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
