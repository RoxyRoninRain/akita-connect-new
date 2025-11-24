import type { User, Akita, Litter, Event } from '../types';

// --- USER MAPPERS ---
export const mapUserFromDb = (dbUser: any): User => ({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    avatar: dbUser.avatar,
    bio: dbUser.bio,
    location: dbUser.location,
    website: dbUser.website,
    joinedDate: dbUser.joined_date,
    dogs: [], // Derived from akitas list in store
    // Optional fields
    kennelName: dbUser.kennel_name, // Assuming we add this to DB later or use metadata
    experienceLevel: dbUser.experience_level,
    yearsOfExperience: dbUser.years_of_experience,
    socialLinks: dbUser.social_links || {}
});

export const mapUserToDb = (user: Partial<User>) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    website: user.website,
    // kennel_name: user.kennelName,
    // experience_level: user.experienceLevel,
    // years_of_experience: user.yearsOfExperience,
    // social_links: user.socialLinks
});

// --- AKITA MAPPERS ---
export const mapAkitaFromDb = (dbAkita: any): Akita => ({
    id: dbAkita.id,
    registeredName: dbAkita.registered_name,
    callName: dbAkita.call_name,
    registrationNumber: dbAkita.registration_number,
    sireId: dbAkita.sire_id,
    damId: dbAkita.dam_id,
    pedigreeImage: dbAkita.pedigree_image,
    ownerId: dbAkita.owner_id,
    breederId: dbAkita.breeder_id, // If added to DB
    dob: dbAkita.dob,
    gender: dbAkita.gender,
    color: dbAkita.color,
    titles: dbAkita.titles || [],
    achievements: dbAkita.achievements || [],
    healthRecords: dbAkita.health_records || [],
    images: dbAkita.images || [],
    bio: dbAkita.bio,
    // mainImage is usually images[0] in frontend, but DB has specific column. 
    // We can prepend it to images if needed, or just rely on images[0]
});

export const mapAkitaToDb = (akita: Partial<Akita>) => ({
    registered_name: akita.registeredName,
    call_name: akita.callName,
    registration_number: akita.registrationNumber,
    sire_id: akita.sireId,
    dam_id: akita.damId,
    pedigree_image: akita.pedigreeImage,
    owner_id: akita.ownerId,
    // breeder_id: akita.breederId,
    dob: akita.dob,
    gender: akita.gender,
    color: akita.color,
    titles: akita.titles,
    achievements: akita.achievements,
    health_records: akita.healthRecords,
    images: akita.images,
    bio: akita.bio,
    main_image: akita.images?.[0] // Use first image as main
});

// --- LITTER MAPPERS ---
export const mapLitterFromDb = (dbLitter: any): Litter => ({
    id: dbLitter.id,
    breederId: dbLitter.breeder_id,
    sireId: dbLitter.sire_id,
    damId: dbLitter.dam_id,
    dob: dbLitter.dob,
    status: dbLitter.status,
    description: dbLitter.description,
    price: dbLitter.price,
    location: dbLitter.location,
    puppies: dbLitter.puppies || [],
    images: dbLitter.images || [],
    approvalStatus: dbLitter.approval_status,
    approvedBy: dbLitter.approved_by,
    approvalDate: dbLitter.approval_date,
    rejectionReason: dbLitter.rejection_reason
});

export const mapLitterToDb = (litter: Partial<Litter>) => ({
    breeder_id: litter.breederId,
    sire_id: litter.sireId,
    dam_id: litter.damId,
    dob: litter.dob,
    status: litter.status,
    description: litter.description,
    price: litter.price,
    location: litter.location,
    puppies: litter.puppies,
    images: litter.images,
    approval_status: litter.approvalStatus,
    approved_by: litter.approvedBy,
    approval_date: litter.approvalDate,
    rejection_reason: litter.rejectionReason
});

// --- EVENT MAPPERS ---
export const mapEventFromDb = (dbEvent: any): Event => ({
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    eventType: dbEvent.event_type,
    location: dbEvent.location,
    address: dbEvent.address,
    startDate: dbEvent.start_date,
    endDate: dbEvent.end_date,
    maxAttendees: dbEvent.max_attendees,
    imageUrl: dbEvent.image_url,
    organizerId: dbEvent.organizer_id,
    createdAt: dbEvent.created_at,
    updatedAt: dbEvent.updated_at,
    rsvps: dbEvent.rsvps?.map((rsvp: any) => ({
        id: rsvp.id,
        eventId: rsvp.event_id,
        userId: rsvp.user_id,
        status: rsvp.status,
        createdAt: rsvp.created_at
    })) || []
});

export const mapEventToDb = (event: Partial<Event>) => ({
    title: event.title,
    description: event.description,
    event_type: event.eventType,
    location: event.location,
    address: event.address,
    start_date: event.startDate,
    end_date: event.endDate,
    max_attendees: event.maxAttendees,
    image_url: event.imageUrl,
    organizer_id: event.organizerId
});
