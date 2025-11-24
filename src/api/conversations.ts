import { api } from './client';

// Conversations API
export const conversationApi = {
    getAll: async () => {
        const { data } = await api.get('/conversations');
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get(`/conversations/${id}`);
        return data;
    },

    create: async (participantIds: string[]) => {
        const { data } = await api.post('/conversations', { participantIds });
        return data;
    },

    sendMessage: async (conversationId: string, content: string, images?: string[]) => {
        const { data } = await api.post(`/conversations/${conversationId}/messages`, { content, images });
        return data;
    }
};
