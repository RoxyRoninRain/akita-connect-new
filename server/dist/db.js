"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabase = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase credentials in .env file');
}
console.log('Initializing Supabase with URL:', supabaseUrl);
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
const getSupabase = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No auth header or invalid format, use service role key
        return exports.supabase;
    }
    try {
        // Create client with user's auth token for RLS
        return (0, supabase_js_1.createClient)(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
            global: {
                headers: { Authorization: authHeader }
            }
        });
    }
    catch (error) {
        console.error('Error creating authenticated Supabase client:', error);
        return exports.supabase;
    }
};
exports.getSupabase = getSupabase;
