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
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting seed...');
    // 1. Create Users
    const users = [
        {
            id: 'd0d8c19c-3b36-4026-b203-123456789001', // Fixed UUIDs for relationships
            email: 'sarah@sakurakennels.com',
            name: 'Sarah Jenkins',
            role: 'breeder',
            location: 'Portland, OR',
            bio: 'Breeding Akitas for 15 years. Focus on temperament and structure.',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
        },
        {
            id: 'd0d8c19c-3b36-4026-b203-123456789002',
            email: 'kenji@example.com',
            name: 'Kenji Tanaka',
            role: 'user',
            location: 'Seattle, WA',
            bio: 'Akita enthusiast and owner of Hachiko.',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
        },
        {
            id: 'd0d8c19c-3b36-4026-b203-123456789004',
            email: 'moderator@akitaconnect.com',
            name: 'Admin Mod',
            role: 'moderator',
            location: 'Online',
            bio: 'Keeping the community safe.',
            avatar: 'https://ui-avatars.com/api/?name=Admin+Mod&background=0D8ABC&color=fff'
        }
    ];
    for (const user of users) {
        const { error } = yield db_1.supabase.from('profiles').upsert(user);
        if (error)
            console.error('Error creating user:', user.name, error.message);
        else
            console.log('Created user:', user.name);
    }
    // 2. Create Akitas
    const akitas = [
        {
            id: 'a0d8c19c-3b36-4026-b203-123456789001',
            owner_id: users[0].id,
            registered_name: 'Sakura no Hana',
            call_name: 'Hana',
            dob: '2020-05-15',
            gender: 'female',
            color: 'Red Fawn',
            main_image: 'https://images.unsplash.com/photo-1563460716037-460a3ad24dd9',
            titles: ['GCH', 'ROM'],
            health_records: [{ type: 'Hips', result: 'Excellent', date: '2022-06-01' }]
        },
        {
            id: 'a0d8c19c-3b36-4026-b203-123456789002',
            owner_id: users[1].id,
            registered_name: 'Kenji no Hachiko',
            call_name: 'Hachi',
            dob: '2019-03-10',
            gender: 'male',
            color: 'Brindle',
            main_image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e',
            titles: ['CH'],
            health_records: [{ type: 'Eyes', result: 'Normal', date: '2021-04-15' }]
        }
    ];
    for (const akita of akitas) {
        const { error } = yield db_1.supabase.from('akitas').upsert(akita);
        if (error)
            console.error('Error creating akita:', akita.call_name, error.message);
        else
            console.log('Created akita:', akita.call_name);
    }
    // 3. Create Litters
    const litters = [
        {
            breeder_id: users[0].id,
            sire_id: akitas[1].id,
            dam_id: akitas[0].id,
            dob: '2023-12-01',
            status: 'Expecting',
            description: 'Expecting a beautiful litter from Hana and Hachi. Waitlist open.',
            price: 2500,
            location: 'Portland, OR',
            approval_status: 'approved',
            approved_by: users[2].id,
            approval_date: new Date().toISOString()
        }
    ];
    for (const litter of litters) {
        const { error } = yield db_1.supabase.from('litters').insert(litter);
        if (error)
            console.error('Error creating litter:', error.message);
        else
            console.log('Created litter');
    }
    console.log('Seed complete!');
});
seedData().catch(console.error);
