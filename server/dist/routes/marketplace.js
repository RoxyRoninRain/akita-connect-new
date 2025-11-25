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
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/marketplace - Get filtered litters for marketplace
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    const { location, status } = req.query;
    try {
        // Start building the query
        let query = supabase
            .from('litters')
            .select(`
                *,
                breeder:profiles!litters_breeder_id_fkey(id, name, kennel_name, location, avatar),
                sire:akitas!litters_sire_id_fkey(id, registered_name, call_name, images),
                dam:akitas!litters_dam_id_fkey(id, registered_name, call_name, images)
            `)
            .in('status', ['Available', 'Expecting', 'Planned'])
            .eq('approval_status', 'approved')
            .order('dob', { ascending: false });
        // Apply status filter if provided
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        // Apply location filter if provided
        // Note: This filters on litter.location field
        // For breeder location, we'd need to do client-side filtering or use a more complex query
        if (location && location !== 'all') {
            query = query.ilike('location', `%${location}%`);
        }
        const { data: litters, error } = yield query;
        if (error) {
            console.error('Error fetching marketplace litters:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json(litters || []);
    }
    catch (error) {
        console.error('Marketplace endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
