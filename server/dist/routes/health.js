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
// POST /api/akitas/:id/health-records - Add health record
router.post('/:id/health-records', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { type, result, date, certificateImage } = req.body;
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current health records
        const { data: akita, error: fetchError } = yield supabase
            .from('akitas')
            .select('health_records, owner_id')
            .eq('id', id)
            .single();
        if (fetchError || !akita) {
            return res.status(404).json({ error: 'Akita not found' });
        }
        // Verify ownership
        const { data: { user } } = yield supabase.auth.getUser();
        if (!user || akita.owner_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Create new health record with ID
        const newRecord = {
            id: `hr_${Date.now()}`,
            type,
            result,
            date,
            certificate_image: certificateImage
        };
        // Append to existing health records
        const healthRecords = akita.health_records || [];
        healthRecords.push(newRecord);
        // Update akita with new health records
        const { data, error: updateError } = yield supabase
            .from('akitas')
            .update({ health_records: healthRecords })
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// PUT /api/akitas/:id/health-records/:recordId - Update health record
router.put('/:id/health-records/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, recordId } = req.params;
    const { type, result, date, certificateImage } = req.body;
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current health records
        const { data: akita, error: fetchError } = yield supabase
            .from('akitas')
            .select('health_records, owner_id')
            .eq('id', id)
            .single();
        if (fetchError || !akita) {
            return res.status(404).json({ error: 'Akita not found' });
        }
        // Verify ownership
        const { data: { user } } = yield supabase.auth.getUser();
        if (!user || akita.owner_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Update the specific health record
        const healthRecords = akita.health_records || [];
        const recordIndex = healthRecords.findIndex((r) => r.id === recordId);
        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Health record not found' });
        }
        healthRecords[recordIndex] = {
            id: recordId,
            type,
            result,
            date,
            certificate_image: certificateImage
        };
        // Update akita with modified health records
        const { data, error: updateError } = yield supabase
            .from('akitas')
            .update({ health_records: healthRecords })
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// DELETE /api/akitas/:id/health-records/:recordId - Delete health record
router.delete('/:id/health-records/:recordId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, recordId } = req.params;
    const supabase = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current health records
        const { data: akita, error: fetchError } = yield supabase
            .from('akitas')
            .select('health_records, owner_id')
            .eq('id', id)
            .single();
        if (fetchError || !akita) {
            return res.status(404).json({ error: 'Akita not found' });
        }
        // Verify ownership
        const { data: { user } } = yield supabase.auth.getUser();
        if (!user || akita.owner_id !== user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Remove the specific health record
        const healthRecords = (akita.health_records || []).filter((r) => r.id !== recordId);
        // Update akita with filtered health records
        const { data, error: updateError } = yield supabase
            .from('akitas')
            .update({ health_records: healthRecords })
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
