import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Akita, Litter, Post, Thread, Event, Reply, Notification, Puppy } from '../types';
import { MOCK_POSTS, MOCK_THREADS } from './mockData';
import { akitaApi, userApi, litterApi, threadApi, postApi, eventApi, notificationsApi } from '../api/client';
import { mapAkitaFromDb, mapUserFromDb, mapLitterFromDb, mapAkitaToDb, mapLitterToDb, mapUserToDb, mapEventFromDb, mapEventToDb } from '../utils/mappers';
import { supabase } from '../supabaseClient';

interface StoreContextType {
    currentUser: User | null;
    users: User[];
    akitas: Akita[];
    litters: Litter[];
    posts: Post[];
    threads: Thread[];
    events: Event[];

    // Auth Actions
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    register: (user: Omit<User, 'id' | 'joinedDate' | 'dogs'>, password?: string) => Promise<void>;

    // Data Actions
    addPost: (content: string, images?: string[]) => void;
    addAkita: (akita: Omit<Akita, 'id'>) => Promise<Akita | undefined>;
    updateAkita: (id: string, updates: Partial<Akita>) => Promise<void>;
    addLitter: (litter: Omit<Litter, 'id'>) => Promise<void>;
    addPuppy: (litterId: string, puppy: Omit<Puppy, 'id' | 'litterId'>) => void;
    addPuppyWeight: (litterId: string, puppyId: string, weightData: { date: string, weight: number }) => Promise<void>;
    toggleLike: (postId: string) => void;
    addComment: (postId: string, content: string) => void;
    updateUser: (id: string, updates: Partial<User>) => Promise<void>;
    addThreadReply: (threadId: string, content: string, images?: string[]) => void;
    addThread: (thread: Omit<Thread, 'id' | 'replies' | 'views' | 'lastActive' | 'likesCount' | 'userHasLiked' | 'isPinned'> & { images?: string[] }) => void;
    toggleThreadLike: (threadId: string) => void;
    toggleThreadPin: (threadId: string) => void;
    addEvent: (event: Omit<Event, 'id' | 'attendees'>) => void;
    toggleEventRSVP: (eventId: string) => void;
    approveLitter: (litterId: string, approved: boolean, reason?: string) => Promise<void>;
    categories: string[];
    addCategory: (category: string) => void;
    removeCategory: (category: string) => void;
    loading: boolean;

    // Notifications
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [akitas, setAkitas] = useState<Akita[]>([]);
    const [litters, setLitters] = useState<Litter[]>([]);
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
    const [events, setEvents] = useState<Event[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [categories, setCategories] = useState<string[]>(['General', 'Health', 'Training', 'Breeding', 'Show Ring']);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        console.log('🔄 StoreContext: Starting data fetch...');
        const fetchData = async () => {
            try {
                // Fetch core data (events optional since table may not exist yet)
                const [dbAkitas, dbUsers, dbLitters, dbThreads, dbPosts] = await Promise.all([
                    akitaApi.getAll(),
                    userApi.getAll(),
                    litterApi.getAll(),
                    threadApi.getAll(),
                    postApi.getAll()
                ]);

                console.log('✅ Core data fetched successfully');

                const mappedAkitas = dbAkitas.map(mapAkitaFromDb);
                const mappedLitters = dbLitters.map(mapLitterFromDb);

                // Map users and populate dogs array
                const mappedUsers = dbUsers.map((u: Record<string, any>) => {
                    const user = mapUserFromDb(u);
                    user.dogs = mappedAkitas
                        .filter((a: Akita) => a.ownerId === user.id)
                        .map((a: Akita) => a.id);
                    return user;
                });

                setAkitas(mappedAkitas);
                setUsers(mappedUsers);
                setLitters(mappedLitters);
                setThreads(dbThreads);
                setPosts(dbPosts);

                // Try to fetch events (may fail if table doesn't exist yet)
                try {
                    const dbEvents = await eventApi.getAll();
                    setEvents(dbEvents.map(mapEventFromDb));
                    console.log('✅ Events fetched successfully');
                } catch (eventError) {
                    console.warn('⚠️ Events table may not exist yet:', eventError);
                    setEvents([]);
                }

                // Check for existing session and set currentUser
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const user = mappedUsers.find((u: User) => u.id === session.user.id);
                    if (user) {
                        console.log('✅ Session found, setting currentUser:', user.email);
                        setCurrentUser(user);
                    }
                }

            } catch (error) {
                console.error("❌ Failed to fetch data", error);
            } finally {
                setLoading(false);
                console.log('✅ StoreContext: Data fetch complete');
            }
        };
        fetchData();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`🔔 Auth state changed: ${event}`);
            if (event === 'SIGNED_IN' && session?.user) {
                // Fetch via API to ensure fresh data and bypass RLS if needed
                console.log('🔵 Fetching profile via API for:', session.user.id);
                userApi.getById(session.user.id)
                    .then(data => {
                        if (data) {
                            const mappedUser = mapUserFromDb(data);
                            console.log('✅ Auth change: Setting currentUser to', mappedUser.email);
                            setCurrentUser(mappedUser);

                            // Also update the users list if this user isn't in it
                            setUsers(prevUsers => {
                                if (!prevUsers.find(u => u.id === mappedUser.id)) {
                                    return [...prevUsers, mappedUser];
                                }
                                return prevUsers;
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching user profile on auth change:', err);
                    });
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password?: string) => {
        if (!password) throw new Error('Password required');
        console.log('🔵 login called with:', email);
        try {
            console.log('🔵 calling signInWithPassword...');
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            console.log('🔵 signInWithPassword returned');
            if (error) {
                console.error('❌ Login error:', error.message);
                throw error;
            }

            if (data.user) {
                console.log('✅ Login successful, fetching profile for:', data.user.email);
                // Manually fetch and set user to ensure UI updates immediately
                const userProfile = await userApi.getById(data.user.id);
                if (userProfile) {
                    const mappedUser = mapUserFromDb(userProfile);
                    setCurrentUser(mappedUser);
                    console.log('✅ currentUser set manually in login');
                } else {
                    console.warn('⚠️ Login succeeded but profile not found');
                }
            }
        } catch (err) {
            console.error('❌ Login failed:', err);
            throw err;
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('❌ Logout error:', error.message);
                throw error;
            }
            setCurrentUser(null);
            console.log('✅ Logged out successfully');
        } catch (error) {
            console.error('❌ Logout failed:', error);
            throw error;
        }
    };

    const register = async (userData: Omit<User, 'id' | 'joinedDate' | 'dogs'>, password?: string) => {
        if (!password) throw new Error("Password required");

        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password
            });

            if (authError) {
                console.error('❌ Registration error:', authError.message);
                throw authError;
            }

            if (!authData.user) {
                throw new Error('User creation failed');
            }

            // 2. Create profile
            const profileData = {
                id: authData.user.id,
                email: userData.email,
                name: userData.name,
                avatar: userData.avatar,
                role: userData.role || 'user',
                location: userData.location,
                bio: userData.bio,
                website: userData.website
            };

            // Insert profile into database
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([mapUserToDb(profileData)]);

            if (profileError) {
                console.error('❌ Profile creation error:', profileError.message);
                // Optional: delete auth user if profile creation fails to maintain consistency
                throw profileError;
            }

            // Manually set currentUser to avoid race condition with onAuthStateChange
            const newUser = mapUserFromDb(profileData);
            setCurrentUser(newUser);
            setUsers(prev => [...prev, newUser]);

            console.log('✅ Registration successful:', authData.user.email);
        } catch (error) {
            console.error("Failed to register user", error);
            throw error;
        }
    };

    const addPost = async (content: string, images?: string[]) => {
        if (!currentUser) return;
        try {
            const newPost = await postApi.create({
                author_id: currentUser.id,
                content,
                images
            });

            // Map DB response to Post type if needed, or assume compatibility
            // Ideally we should have a mapper, but for now:
            const mappedPost: Post = {
                id: newPost.id,
                authorId: newPost.author_id,
                content: newPost.content,
                images: newPost.images,
                likes: [],
                comments: [],
                timestamp: newPost.created_at
            };
            setPosts([mappedPost, ...posts]);
        } catch (error) {
            console.error("Failed to add post", error);
        }
    };

    const addAkita = async (akitaData: Omit<Akita, 'id'>) => {
        try {
            const dbAkitaData = mapAkitaToDb(akitaData);
            const createdAkita = await akitaApi.create(dbAkitaData);
            const newAkita = mapAkitaFromDb(createdAkita);

            setAkitas([...akitas, newAkita]);

            // Update owner's dog list locally
            setUsers(users.map((u: User) => {
                if (u.id === akitaData.ownerId) {
                    return { ...u, dogs: [...u.dogs, newAkita.id] };
                }
                return u;
            }));
            return newAkita;
        } catch (error) {
            console.error("Failed to add akita", error);
            throw error;
        }
    };

    const updateAkita = async (id: string, updates: Partial<Akita>) => {
        try {
            const dbUpdates = mapAkitaToDb(updates);
            await akitaApi.update(id, dbUpdates);
            setAkitas(akitas.map((dog: Akita) => dog.id === id ? { ...dog, ...updates } : dog));
        } catch (error) {
            console.error("Failed to update akita", error);
            throw error;
        }
    };

    const addLitter = async (litterData: Omit<Litter, 'id'>) => {
        try {
            const dbLitterData = mapLitterToDb(litterData);
            const createdLitter = await litterApi.create(dbLitterData);
            const newLitter = mapLitterFromDb(createdLitter);
            setLitters([...litters, newLitter]);
        } catch (error) {
            console.error("Failed to add litter", error);
            throw error;
        }
    };

    const addPuppy = async (litterId: string, puppy: Omit<Puppy, 'id' | 'litterId'>) => {
        try {
            const litter = litters.find(l => l.id === litterId);
            if (!litter) throw new Error("Litter not found");

            const newPuppy = {
                ...puppy,
                id: `pup${Date.now()}`,
                litterId
            };

            const updatedPuppies = [...(litter.puppies || []), newPuppy];

            // Update in DB
            await litterApi.update(litterId, { puppies: updatedPuppies });

            // Update local state
            setLitters(litters.map((l: Litter) => {
                if (l.id === litterId) {
                    return {
                        ...l,
                        puppies: updatedPuppies
                    };
                }
                return l;
            }));
        } catch (error) {
            console.error("Failed to add puppy", error);
            throw error;
        }
    };

    const addPuppyWeight = async (litterId: string, puppyId: string, weightData: { date: string, weight: number }) => {
        try {
            const updatedLitter = await litterApi.addPuppyWeight(litterId, puppyId, weightData);
            const mappedLitter = mapLitterFromDb(updatedLitter);

            setLitters(litters.map((l: Litter) =>
                l.id === litterId ? mappedLitter : l
            ));
        } catch (error) {
            console.error("Failed to add puppy weight", error);
            throw error;
        }
    };

    const toggleLike = async (postId: string) => {
        if (!currentUser) return;
        try {
            await postApi.like(postId);
            // Toggle optimistically
            setPosts(posts.map((post: Post) => {
                if (post.id === postId) {
                    const hasLiked = post.likes.includes(currentUser.id);
                    return {
                        ...post,
                        likes: hasLiked
                            ? post.likes.filter((id: string) => id !== currentUser.id)
                            : [...post.likes, currentUser.id]
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const addComment = async (postId: string, content: string) => {
        if (!currentUser) return;
        try {
            const newComment = await postApi.comment(postId, content);

            const mappedComment = {
                id: newComment.id,
                authorId: newComment.author_id,
                content: newComment.content,
                timestamp: newComment.created_at
            };

            setPosts(posts.map((post: Post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, mappedComment]
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    const updateUser = async (id: string, updates: Partial<User>) => {
        try {
            const dbUpdates = mapUserToDb(updates);
            // Ensure ID is present for upsert
            await userApi.update(id, { ...dbUpdates, id });

            setUsers(users.map((u: User) => u.id === id ? { ...u, ...updates } : u));
            if (currentUser && currentUser.id === id) {
                setCurrentUser({ ...currentUser, ...updates });
            }
        } catch (error) {
            console.error("Failed to update user", error);
            throw error;
        }
    };

    const addThreadReply = async (threadId: string, content: string, images?: string[]) => {
        if (!currentUser) return;
        try {
            const newReply = await threadApi.reply(threadId, {
                author_id: currentUser.id,
                content,
                images
            });

            const mappedReply: Reply = {
                id: newReply.id,
                authorId: newReply.author_id,
                content: newReply.content,
                timestamp: newReply.created_at,
                images: newReply.images || []
            };

            setThreads(threads.map((thread: Thread) => {
                if (thread.id === threadId) {
                    return {
                        ...thread,
                        replies: [...thread.replies, mappedReply],
                        lastActive: new Date().toISOString()
                    };
                }
                return thread;
            }));
        } catch (error) {
            console.error("Failed to add reply", error);
        }
    };

    const addThread = async (threadData: Omit<Thread, 'id' | 'replies' | 'views' | 'lastActive' | 'likesCount' | 'userHasLiked' | 'isPinned'> & { images?: string[] }) => {
        if (!currentUser) return;
        try {
            const newThread = await threadApi.create({
                author_id: currentUser.id,
                category: threadData.category,
                title: threadData.title,
                content: threadData.content,
                tags: threadData.tags,
                images: threadData.images || []
            });

            const mappedThread: Thread = {
                id: newThread.id,
                authorId: newThread.author_id,
                category: newThread.category,
                title: newThread.title,
                content: newThread.content,
                replies: [],
                views: 0,
                lastActive: newThread.last_active,
                tags: newThread.tags || [],
                isPinned: newThread.is_pinned || false,
                likesCount: 0,
                userHasLiked: false,
                images: newThread.images || []
            };

            setThreads([mappedThread, ...threads]);
        } catch (error) {
            console.error("Failed to add thread", error);
        }
    };

    const toggleThreadLike = async (threadId: string) => {
        if (!currentUser) return;
        try {
            await threadApi.like(threadId);
            setThreads(threads.map(t => {
                if (t.id === threadId) {
                    const newLiked = !t.userHasLiked;
                    return {
                        ...t,
                        userHasLiked: newLiked,
                        likesCount: (t.likesCount || 0) + (newLiked ? 1 : -1)
                    };
                }
                return t;
            }));
        } catch (error) {
            console.error("Failed to toggle thread like", error);
        }
    };

    const toggleThreadPin = async (threadId: string) => {
        if (!currentUser) return; // Should check admin role too
        try {
            await threadApi.pin(threadId);
            setThreads(threads.map(t => {
                if (t.id === threadId) {
                    return { ...t, isPinned: !t.isPinned };
                }
                return t;
            }));
        } catch (error) {
            console.error("Failed to toggle thread pin", error);
        }
    };

    const addEvent = async (eventData: Omit<Event, 'id' | 'attendees'>) => {
        if (!currentUser) return;
        try {
            const dbEventData = mapEventToDb(eventData);
            const newEvent = await eventApi.create(dbEventData);
            const mappedEvent = mapEventFromDb(newEvent);
            // Initialize with empty RSVPs if not present
            if (!mappedEvent.rsvps) mappedEvent.rsvps = [];
            setEvents([...events, mappedEvent]);
        } catch (error) {
            console.error("Failed to add event", error);
            throw error;
        }
    };

    const toggleEventRSVP = async (eventId: string) => {
        if (!currentUser) return;
        try {
            const event = events.find(e => e.id === eventId);
            if (!event) return;

            const existingRsvp = event.rsvps?.find(r => r.userId === currentUser.id);

            if (existingRsvp) {
                // Remove RSVP
                await eventApi.removeRsvp(eventId);
                setEvents(events.map(e => {
                    if (e.id === eventId) {
                        return {
                            ...e,
                            rsvps: e.rsvps?.filter(r => r.userId !== currentUser.id) || []
                        };
                    }
                    return e;
                }));
            } else {
                // Add RSVP (default to 'going')
                const newRsvp = await eventApi.rsvp(eventId, 'going');
                // The API returns the RSVP object, we need to map it or use it directly if it matches
                // Since we don't have a specific mapEventRSVPFromDb, we'll construct it manually or rely on the API returning compatible shape
                // But wait, the API returns snake_case. We should map it.
                const mappedRsvp = {
                    id: newRsvp.id,
                    eventId: newRsvp.event_id,
                    userId: newRsvp.user_id,
                    status: newRsvp.status,
                    createdAt: newRsvp.created_at
                };

                setEvents(events.map(e => {
                    if (e.id === eventId) {
                        return {
                            ...e,
                            rsvps: [...(e.rsvps || []), mappedRsvp]
                        };
                    }
                    return e;
                }));
            }
        } catch (error) {
            console.error("Failed to toggle RSVP", error);
            throw error;
        }
    };

    const approveLitter = async (litterId: string, approved: boolean, reason?: string) => {
        if (!currentUser || currentUser.role !== 'moderator') return;

        try {
            if (approved) {
                await litterApi.approve(litterId, currentUser.id);
            } else {
                await litterApi.reject(litterId, reason || 'No reason provided');
            }

            setLitters(litters.map((litter: Litter) => {
                if (litter.id === litterId) {
                    return {
                        ...litter,
                        approvalStatus: approved ? 'approved' as const : 'rejected' as const,
                        approvedBy: approved ? currentUser.id : undefined,
                        approvalDate: approved ? new Date().toISOString() : undefined,
                        rejectionReason: !approved ? reason : undefined
                    };
                }
                return litter;
            }));
        } catch (error) {
            console.error("Failed to approve/reject litter", error);
            throw error;
        }
    };

    const addCategory = (category: string) => {
        if (!currentUser || currentUser.role !== 'moderator') return;
        if (categories.includes(category)) return;
        setCategories([...categories, category]);
    };

    const removeCategory = (category: string) => {
        if (!currentUser || currentUser.role !== 'moderator') return;
        setCategories(categories.filter((c: string) => c !== category));
    };

    const markAsRead = async (id: string) => {
        if (!currentUser) return;
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;
        try {
            await notificationsApi.markAllAsRead(currentUser.id);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    const deleteNotification = async (id: string) => {
        if (!currentUser) return;
        try {
            await notificationsApi.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <StoreContext.Provider value={{
            currentUser,
            users,
            akitas,
            litters,
            posts,
            threads,
            events,
            login,
            logout,
            register,
            addPost,
            addAkita,
            updateAkita,
            addLitter,
            addPuppy,
            addPuppyWeight,
            toggleLike,
            addComment,
            updateUser,
            addThreadReply,
            addThread,
            toggleThreadLike,
            toggleThreadPin,
            addEvent,
            toggleEventRSVP,
            approveLitter,
            categories,
            addCategory,
            removeCategory,
            loading,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within StoreProvider');
    }
    return context;
};
