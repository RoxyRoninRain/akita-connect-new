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
// GET /api/conversations - Get all conversations for current user
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminClient = db_1.supabase;
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current user
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const currentUserId = user.id;
        // Get conversations where user is a participant (using admin client to bypass RLS)
        const { data: participations, error: participationsError } = yield adminClient
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);
        if (participationsError) {
            return res.status(500).json({ error: participationsError.message });
        }
        const conversationIds = (participations === null || participations === void 0 ? void 0 : participations.map((p) => p.conversation_id)) || [];
        if (conversationIds.length === 0) {
            return res.json([]);
        }
        // Get conversations with last message and participants
        const { data: conversations, error: conversationsError } = yield adminClient
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
        const enrichedConversations = yield Promise.all((conversations || []).map((conv) => __awaiter(void 0, void 0, void 0, function* () {
            // Get participants
            const { data: participants } = yield adminClient
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
            const { data: lastMessage } = yield adminClient
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
            const userParticipation = participants === null || participants === void 0 ? void 0 : participants.find((p) => p.user_id === currentUserId);
            const { count: unreadCount } = yield adminClient
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .gt('created_at', (userParticipation === null || userParticipation === void 0 ? void 0 : userParticipation.last_read_at) || '1970-01-01');
            return Object.assign(Object.assign({}, conv), { participants: participants === null || participants === void 0 ? void 0 : participants.map((p) => ({
                    id: p.profiles.id,
                    name: p.profiles.name,
                    avatar: p.profiles.avatar,
                    lastReadAt: p.last_read_at
                })), lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    created_at: lastMessage.created_at,
                    sender: {
                        id: lastMessage.sender.id,
                        name: lastMessage.sender.name,
                        avatar: lastMessage.sender.avatar
                    }
                } : null, unreadCount: unreadCount || 0 });
        })));
        res.json(enrichedConversations);
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: error.message });
    }
}));
// GET /api/conversations/:id - Get specific conversation
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminClient = db_1.supabase;
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    try {
        // Get current user
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Use admin client to fetch conversation and participants to bypass RLS
        const { data: conversation, error: conversationError } = yield adminClient
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
        const { data: participants, error: participantsError } = yield adminClient
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
        const isParticipant = participants.some((p) => p.user_id === user.id);
        if (!isParticipant) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Fetch messages
        const { data: messages, error: messagesError } = yield adminClient
            .from('messages')
            .select(`
                id,
                content,
                created_at,
                attachments,
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
        yield adminClient
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', req.params.id)
            .eq('user_id', user.id);
        // Format response
        const formattedConversation = Object.assign(Object.assign({}, conversation), { participants: participants.map((p) => ({
                id: p.profiles.id,
                name: p.profiles.name,
                avatar: p.profiles.avatar,
                lastReadAt: p.last_read_at
            })), messages: messages.map((m) => ({
                id: m.id,
                content: m.content,
                created_at: m.created_at,
                sender: {
                    id: m.sender.id,
                    name: m.sender.name,
                    avatar: m.sender.avatar
                }
            })) });
        res.json(formattedConversation);
    }
    catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/conversations - Create new conversation
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminClient = db_1.supabase;
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { participantIds } = req.body; // Array of user IDs
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ error: 'participantIds array is required' });
    }
    try {
        // Get current user ID from auth header
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const currentUserId = user.id;
        // Create conversation using service role to bypass RLS
        const { data: conversation, error: convError } = yield adminClient
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
        const participantRecords = allParticipantIds.map((userId) => ({
            conversation_id: conversation.id,
            user_id: userId
        }));
        const { error: participantsError } = yield adminClient
            .from('conversation_participants')
            .insert(participantRecords);
        if (participantsError) {
            console.error('Error adding participants:', participantsError);
            // Rollback - delete the conversation
            yield adminClient.from('conversations').delete().eq('id', conversation.id);
            return res.status(500).json({ error: participantsError.message });
        }
        res.status(201).json(conversation);
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: error.message });
    }
}));
router.post('/:id/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminClient = db_1.supabase;
    const userClient = (0, db_1.getSupabase)(req.headers.authorization);
    const { id } = req.params;
    const { content, images } = req.body;
    // Require either content or images
    if ((!content || content.trim() === '') && (!images || images.length === 0)) {
        return res.status(400).json({ error: 'Message content or images required' });
    }
    try {
        const { data: { user }, error: authError } = yield userClient.auth.getUser();
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const currentUserId = user.id;
        // Verify user is participant using admin client
        const { data: participation } = yield adminClient
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', id)
            .eq('user_id', currentUserId)
            .single();
        if (!participation) {
            return res.status(403).json({ error: 'Not a participant in this conversation' });
        }
        // Create message using admin client
        const { data: message, error: messageError } = yield adminClient
            .from('messages')
            .insert([{
                conversation_id: id,
                sender_id: currentUserId,
                content: content ? content.trim() : '',
                attachments: images || []
            }])
            .select(`
                id,
                content,
                created_at,
                attachments,
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
        yield adminClient
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', id);
        // Create notifications for other participants
        const { data: participants } = yield adminClient
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', id)
            .neq('user_id', currentUserId);
        if (participants) {
            const notifications = participants.map((p) => {
                var _a;
                return ({
                    user_id: p.user_id,
                    type: 'message',
                    title: 'New Message',
                    message: `${((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.name) || 'Someone'} sent you a message`,
                    link: `/messages/${id}`
                });
            });
            if (notifications.length > 0) {
                yield adminClient
                    .from('notifications')
                    .insert(notifications);
            }
        }
        const msg = message;
        res.status(201).json({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            attachments: msg.attachments || [],
            sender: {
                id: msg.sender.id,
                name: msg.sender.name,
                avatar: msg.sender.avatar
            }
        });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
