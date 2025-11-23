import { Router, Request, Response } from 'express';
import { getSupabase, supabase } from '../db';

const router = Router();

// GET /api/conversations - Get all conversations for current user
router.get('/', async (req: Request, res: Response) => {
    const adminClient = supabase;
    const userClient = getSupabase(req.headers.authorization);

    try {
        // Get current user
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const currentUserId = user.id;

        // Get conversations where user is a participant (using admin client to bypass RLS)
        const { data: participations, error: participationsError } = await adminClient
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);

        if (participationsError) {
            return res.status(500).json({ error: participationsError.message });
        }

        const conversationIds = participations?.map((p: any) => p.conversation_id) || [];

        if (conversationIds.length === 0) {
            return res.json([]);
        }

        // Get conversations with last message and participants
        const { data: conversations, error: conversationsError } = await adminClient
            .from('conversations')
            .select(`
                id,
                created_at,
                updated_at
            `)
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

        if (conversationsError) {
            return res.status(500).json({ error: conversationsError.message });
        }

        // For each conversation, get participants and last message
        const enrichedConversations = await Promise.all(
            (conversations || []).map(async (conv: any) => {
                // Get participants
                const { data: participants } = await adminClient
                    .from('conversation_participants')
                    .select(`
                        user_id,
                        last_read_at,
                        profiles:user_id (
                            id,
                            name,
                            avatar
                        )
                    `)
                    .eq('conversation_id', conv.id);

                // Get last message
                const { data: lastMessage } = await adminClient
                    .from('messages')
                    .select(`
                        id,
                        content,
                        created_at,
                        sender_id,
                        sender:sender_id (
                            id,
                            name,
                            avatar
                        )
                    `)
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Get unread count for current user
                const userParticipation = participants?.find((p: any) => p.user_id === currentUserId);

                const { count: unreadCount } = await adminClient
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .gt('created_at', userParticipation?.last_read_at || '1970-01-01');

                return {
                    ...conv,
                    participants: participants?.map((p: any) => ({
                        id: p.profiles.id,
                        name: p.profiles.name,
                        avatar: p.profiles.avatar,
                        lastReadAt: p.last_read_at
                    })),
                    lastMessage: lastMessage ? {
                        id: (lastMessage as any).id,
                        content: (lastMessage as any).content,
                        created_at: (lastMessage as any).created_at,
                        sender: {
                            id: (lastMessage as any).sender.id,
                            name: (lastMessage as any).sender.name,
                            avatar: (lastMessage as any).sender.avatar
                        }
                    } : null,
                    unreadCount: unreadCount || 0
                };
            })
        );

        res.json(enrichedConversations);
    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/conversations/:id - Get specific conversation
router.get('/:id', async (req: Request, res: Response) => {
    const adminClient = supabase;
    const userClient = getSupabase(req.headers.authorization);

    try {
        // Get current user
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Use admin client to fetch conversation and participants to bypass RLS
        const { data: conversation, error: conversationError } = await adminClient
            .from('conversations')
            .select(`
                id,
                created_at,
                updated_at
            `)
            .eq('id', req.params.id)
            .single();

        if (conversationError) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Fetch participants
        const { data: participants, error: participantsError } = await adminClient
            .from('conversation_participants')
            .select(`
                user_id,
                last_read_at,
                profiles:user_id (
                    id,
                    name,
                    avatar
                )
            `)
            .eq('conversation_id', req.params.id);

        if (participantsError) {
            return res.status(500).json({ error: participantsError.message });
        }

        // SECURITY CHECK: Ensure current user is a participant
        const isParticipant = participants.some((p: any) => p.user_id === user.id);
        if (!isParticipant) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Fetch messages
        const { data: messages, error: messagesError } = await adminClient
            .from('messages')
            .select(`
                id,
                content,
                created_at,
                sender:sender_id (
                    id,
                    name,
                    avatar
                )
            `)
            .eq('conversation_id', req.params.id)
            .order('created_at', { ascending: true });

        if (messagesError) {
            return res.status(500).json({ error: messagesError.message });
        }

        // Update last_read_at for current user
        await adminClient
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', req.params.id)
            .eq('user_id', user.id);

        // Format response
        const formattedConversation = {
            ...conversation,
            participants: participants.map((p: any) => ({
                id: p.profiles.id,
                name: p.profiles.name,
                avatar: p.profiles.avatar,
                lastReadAt: p.last_read_at
            })),
            messages: messages.map((m: any) => ({
                id: m.id,
                content: m.content,
                created_at: m.created_at,
                sender: {
                    id: m.sender.id,
                    name: m.sender.name,
                    avatar: m.sender.avatar
                }
            }))
        };

        res.json(formattedConversation);
    } catch (error: any) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/conversations - Create new conversation
router.post('/', async (req: Request, res: Response) => {
    const adminClient = supabase;
    const userClient = getSupabase(req.headers.authorization);
    const { participantIds } = req.body; // Array of user IDs

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ error: 'participantIds array is required' });
    }

    try {
        // Get current user ID from auth header
        const { data: { user }, error: authError } = await userClient.auth.getUser();

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const currentUserId = user.id;

        // Create conversation using service role to bypass RLS
        const { data: conversation, error: convError } = await adminClient
            .from('conversations')
            .insert([{}])
            .select()
            .single();

        if (convError) {
            console.error('Error creating conversation:', convError);
            return res.status(500).json({ error: convError.message });
        }

        // Add all participants (including current user) using service role
        const allParticipantIds = [...new Set([currentUserId, ...participantIds])];
        const participantRecords = allParticipantIds.map((userId: string) => ({
            conversation_id: conversation.id,
            user_id: userId
        }));

        const { error: participantsError } = await adminClient
            .from('conversation_participants')
            .insert(participantRecords);

        if (participantsError) {
            console.error('Error adding participants:', participantsError);
            // Rollback - delete the conversation
            await adminClient.from('conversations').delete().eq('id', conversation.id);
            return res.status(500).json({ error: participantsError.message });
        }

        res.status(201).json(conversation);
    } catch (error: any) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/conversations/:id/messages - Send message
router.post('/:id/messages', async (req: Request, res: Response) => {
    const adminClient = supabase;
    const userClient = getSupabase(req.headers.authorization);
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message content is required' });
    }

    try {
        const { data: { user }, error: authError } = await userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const currentUserId = user.id;

        // Verify user is participant using admin client
        const { data: participation } = await adminClient
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', id)
            .eq('user_id', currentUserId)
            .single();

        if (!participation) {
            return res.status(403).json({ error: 'Not a participant in this conversation' });
        }

        // Create message using admin client
        const { data: message, error: messageError } = await adminClient
            .from('messages')
            .insert([{
                conversation_id: id,
                sender_id: currentUserId,
                content: content.trim()
            }])
            .select(`
                id,
                content,
                created_at,
                sender:sender_id (
                    id,
                    name,
                    avatar
                )
            `)
            .single();

        if (messageError) {
            return res.status(500).json({ error: messageError.message });
        }

        // Update conversation timestamp
        await adminClient
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', id);

        const msg = message as any;
        res.status(201).json({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender: {
                id: msg.sender.id,
                name: msg.sender.name,
                avatar: msg.sender.avatar
            }
        });
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
