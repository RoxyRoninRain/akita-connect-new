export type UserRole = 'breeder' | 'owner' | 'enthusiast' | 'moderator';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    bio?: string;
    location?: string;
    kennelName?: string; // For breeders
    website?: string; // For breeders
    experienceLevel?: 'novice' | 'intermediate' | 'expert'; // For owners
    joinedDate: string;
    dogs: string[]; // Array of Akita IDs
    gallery?: string[]; // General gallery images
    socialLinks?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
    };
    yearsOfExperience?: number;
    reputation?: number;
    followers_count?: number;
    following_count?: number;
}

export interface HealthRecord {
    id?: string;
    type: 'OFA Hips' | 'OFA Elbows' | 'OFA Eyes' | 'Thyroid' | 'VGL' | 'Other';
    result: string;
    date: string;
    certificateImage?: string;
}

export interface Akita {
    id: string;
    registeredName: string;
    callName: string;
    registrationNumber?: string; // e.g., AKC WS12345
    sireId?: string;
    damId?: string;
    pedigreeImage?: string; // Uploaded pedigree certificate image
    ownerId: string;
    breederId?: string;
    dob: string;
    gender: 'male' | 'female';
    color: string;
    titles: string[];
    achievements: string[];
    healthRecords: HealthRecord[];
    images: string[];
    bio?: string;
}

export interface Puppy {
    id: string;
    litterId: string;
    name: string; // Temporary name
    gender: 'male' | 'female';
    color: string;
    status: 'Available' | 'Reserved' | 'Sold' | 'Keeper';
    price?: number;
    growthHistory: { date: string; weight: number }[];
    images: string[];
}

export interface Litter {
    id: string;
    breederId: string;
    sireId: string;
    damId: string;
    dob: string; // Was whelpDate
    status: 'Planned' | 'Expecting' | 'Available' | 'Sold Out' | 'Reserved' | 'Sold'; // Added DB statuses
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string; // Moderator user ID
    approvalDate?: string;
    rejectionReason?: string;
    puppies: Puppy[];
    description: string;
    price?: number;
    location?: string;
    images: string[]; // Was coverImage
}

export interface Comment {
    id: string;
    authorId: string;
    content: string;
    timestamp: string;
    likesCount?: number;
    userHasLiked?: boolean;
}

export interface Post {
    id: string;
    authorId: string;
    content: string;
    images?: string[];
    likes: string[]; // User IDs
    comments: Comment[];
    timestamp: string;
}

export interface Thread {
    id: string;
    authorId: string;
    category: string;
    title: string;
    content: string;
    replies: Comment[];
    views: number;
    lastActive: string;
    isPinned?: boolean;
    tags?: string[];
    likesCount?: number;
    userHasLiked?: boolean;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    eventType: 'show' | 'meetup' | 'seminar' | 'other';
    location: string;
    address?: string;
    startDate: string;
    endDate?: string;
    maxAttendees?: number;
    imageUrl?: string;
    organizerId: string;
    createdAt?: string;
    updatedAt?: string;
    rsvps?: EventRSVP[];
}

export interface EventRSVP {
    id: string;
    eventId: string;
    userId: string;
    status: 'going' | 'interested' | 'not_going';
    createdAt: string;
}

// Legacy Event interface for StoreContext compatibility
export interface LegacyEvent {
    id: string;
    organizerId: string;
    title: string;
    description: string;
    date: string;
    location: string;
    attendees: string[]; // User IDs
    type: 'show' | 'meetup' | 'seminar';
}
