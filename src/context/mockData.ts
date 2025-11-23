import type { User, Akita, Litter, Post, Thread } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Sarah Jenkins',
        email: 'sarah@sakurakennels.com',
        role: 'breeder',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        kennelName: 'Sakura Akitas',
        bio: 'Preserving the Japanese Akita since 2010. Focus on temperament and type.',
        location: 'Portland, OR',
        joinedDate: '2023-01-15',
        dogs: ['d1', 'd2', 'd3']
    },
    {
        id: 'u2',
        name: 'Mike Chen',
        email: 'mike.c@email.com',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        experienceLevel: 'intermediate',
        bio: 'Proud owner of two beautiful Akitas. Hiking enthusiast.',
        location: 'Seattle, WA',
        joinedDate: '2023-03-20',
        dogs: ['d4']
    },
    {
        id: 'u3',
        name: 'Elena Rodriguez',
        email: 'elena@email.com',
        role: 'enthusiast',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        bio: 'Dreaming of owning an Akita one day. Here to learn!',
        location: 'Austin, TX',
        joinedDate: '2023-06-10',
        dogs: []
    },
    {
        id: 'u4',
        name: 'Admin Moderator',
        email: 'moderator@akitaconnect.com',
        role: 'moderator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        bio: 'Platform moderator ensuring ethical breeding standards.',
        location: 'Platform',
        joinedDate: '2023-01-01',
        dogs: []
    }
];

export const MOCK_AKITAS: Akita[] = [
    {
        id: 'd1',
        registeredName: 'GCH Sakura\'s Cherry Blossom',
        callName: 'Hana',
        ownerId: 'u1',
        dob: '2020-04-15',
        gender: 'female',
        color: 'Red Fawn',
        titles: ['GCH', 'ROM'],
        healthRecords: [
            { type: 'OFA Hips', result: 'Excellent', date: '2022-05-01' },
            { type: 'OFA Eyes', result: 'Normal', date: '2023-05-01' }
        ],
        achievements: ['Best of Breed - National Specialty 2023'],
        bio: 'Hana is the foundation of our kennel. Sweet temperament and excellent structure.',
        images: ['https://images.unsplash.com/photo-1563460716037-460a3ad24dd9?auto=format&fit=crop&q=80&w=800']
    },
    {
        id: 'd2',
        registeredName: 'CH Sakura\'s Rising Sun',
        callName: 'Kenji',
        ownerId: 'u1',
        dob: '2021-06-20',
        gender: 'male',
        color: 'Red',
        titles: ['CH'],
        healthRecords: [
            { type: 'OFA Hips', result: 'Good', date: '2023-07-01' }
        ],
        achievements: [],
        bio: 'Kenji is a promising young male with heavy bone and a bear-like head.',
        images: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800']
    },
    {
        id: 'd3',
        registeredName: 'Sakura\'s Winter Moon',
        callName: 'Yuki',
        ownerId: 'u1',
        dob: '2018-12-10',
        gender: 'female',
        color: 'White',
        titles: [],
        healthRecords: [],
        achievements: [],
        bio: 'Retired from showing, Yuki is the queen of the house.',
        images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800']
    },
    {
        id: 'd4',
        registeredName: 'Mountain Peak\'s Kuma',
        callName: 'Kuma',
        ownerId: 'u2',
        dob: '2022-01-05',
        gender: 'male',
        color: 'Brindle',
        titles: [],
        healthRecords: [],
        achievements: ['CGC'],
        bio: 'Kuma loves long hikes and snow.',
        images: ['https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&q=80&w=800']
    }
];

export const MOCK_LITTERS: Litter[] = [
    {
        id: 'l1',
        breederId: 'u1',
        sireId: 'd2',
        damId: 'd1',
        dob: '2023-12-01',
        status: 'Expecting',
        approvalStatus: 'approved',
        approvedBy: 'u4',
        approvalDate: '2023-11-01',
        puppies: [],
        description: 'Very excited for this repeat breeding! Expecting excellent temperaments.',
        images: ['https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&q=80&w=800'],
        price: 2500,
        location: 'Portland, OR'
    }
];

export const MOCK_POSTS: Post[] = [
    {
        id: 'p1',
        authorId: 'u1',
        content: 'Hana took Best of Breed today! So proud of this girl.',
        images: ['https://images.unsplash.com/photo-1563460716037-460a3ad24dd9?auto=format&fit=crop&q=80&w=800'],
        likes: ['u2', 'u3'],
        comments: [
            { id: 'c1', authorId: 'u2', content: 'Congratulations! She looks stunning.', timestamp: '2023-11-15T10:30:00Z' }
        ],
        timestamp: '2023-11-15T10:00:00Z'
    },
    {
        id: 'p2',
        authorId: 'u2',
        content: 'Kuma enjoying the first snow of the season!',
        images: ['https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&q=80&w=800'],
        likes: ['u1'],
        comments: [],
        timestamp: '2023-11-16T09:00:00Z'
    }
];

export const MOCK_THREADS: Thread[] = [
    {
        id: 't1',
        authorId: 'u3',
        category: 'General',
        title: 'Tips for first time Akita owner?',
        content: 'I am planning to get an Akita puppy next year. What are the most important things I should know?',
        replies: [
            { id: 'r1', authorId: 'u1', content: 'Socialization is key! Start early and be consistent.', timestamp: '2023-11-10T15:00:00Z' }
        ],
        views: 150,
        lastActive: '2023-11-10T15:00:00Z'
    }
];
