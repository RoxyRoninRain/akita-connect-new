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
// GET /api/akitas - List all akitas
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield db_1.supabase
        .from('akitas')
        .select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
}));
// GET /api/akitas/:id - Get single akita
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { data, error } = yield db_1.supabase
        .from('akitas')
        .select('*')
        .eq('id', id)
        .single();
    if (error) {
        return res.status(404).json({ error: 'Akita not found' });
    }
    res.json(data);
}));
// POST /api/akitas - Create new akita
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const akitaData = req.body;
    // Basic validation
    if (!akitaData.registered_name || !akitaData.call_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = yield db_1.supabase
        .from('akitas')
        .insert([akitaData])
        .select()
        .single();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
}));
// PUT /api/akitas/:id - Update akita
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = yield db_1.supabase
        .from('akitas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
}));
// GET /api/akitas/:id/pedigree - Get pedigree tree (3 generations)
router.get('/:id/pedigree', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Recursive function to fetch ancestors
    const fetchAncestors = (akitaId_1, ...args_1) => __awaiter(void 0, [akitaId_1, ...args_1], void 0, function* (akitaId, depth = 0) {
        if (depth > 2)
            return null; // Limit to 3 generations (0, 1, 2 = self, parents, grandparents)
        const { data: akita, error } = yield db_1.supabase
            .from('akitas')
            .select('*')
            .eq('id', akitaId)
            .single();
        if (error || !akita)
            return null;
        // Recursively fetch sire and dam
        const sire = akita.sire_id ? yield fetchAncestors(akita.sire_id, depth + 1) : null;
        const dam = akita.dam_id ? yield fetchAncestors(akita.dam_id, depth + 1) : null;
        return Object.assign(Object.assign({}, akita), { sire,
            dam });
    });
    try {
        const pedigree = yield fetchAncestors(id);
        if (!pedigree) {
            return res.status(404).json({ error: 'Akita not found' });
        }
        res.json(pedigree);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
