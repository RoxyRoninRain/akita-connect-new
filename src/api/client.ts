import axios from 'axios';
import { supabase } from '../supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests if available
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export const akitaApi = {
    getAll: () => api.get('/akitas').then(res => res.data),
    getById: (id: string) => api.get(`/akitas/${id}`).then(res => res.data),
    getPedigree: (id: string) => api.get(`/akitas/${id}/pedigree`).then(res => res.data),
    create: (data: any) => api.post('/akitas', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/akitas/${id}`, data).then(res => res.data),
};

export const userApi = {
    getAll: () => api.get('/users').then(res => res.data),
    getById: (id: string) => api.get(`/users/${id}`).then(res => res.data),
    update: (id: string, data: any) => api.put(`/users/${id}`, data).then(res => res.data)
};

export const litterApi = {
    getAll: () => api.get('/litters').then(res => res.data),
    create: (data: any) => api.post('/litters', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/litters/${id}`, data).then(res => res.data),
    approve: (id: string, approvedBy: string) => api.put(`/litters/${id}/approve`, { approved_by: approvedBy }).then(res => res.data),
    reject: (id: string, reason: string) => api.put(`/litters/${id}/reject`, { rejection_reason: reason }).then(res => res.data),
    addPuppyWeight: (litterId: string, puppyId: string, data: { date: string, weight: number }) =>
        api.post(`/litters/${litterId}/puppies/${puppyId}/weight`, data).then(res => res.data),
    getGrowthChart: (litterId: string) => api.get(`/litters/${litterId}/growth-chart`).then(res => res.data),
};

export const threadApi = {
    getAll: (page = 1, limit = 10) => api.get(`/threads?page=${page}&limit=${limit}`).then(res => res.data),
    getById: (id: string) => api.get(`/threads/${id}`).then(res => res.data),
    create: (data: any) => api.post('/threads', data).then(res => res.data),
    reply: (id: string, data: any) => api.post(`/threads/${id}/reply`, data).then(res => res.data),
    like: (id: string) => api.post(`/threads/${id}/like`).then(res => res.data),
    pin: (id: string) => api.post(`/threads/${id}/pin`).then(res => res.data),
};

export const postApi = {
    getAll: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`).then(res => res.data),
    getById: (id: string) => api.get(`/posts/${id}`).then(res => res.data),
    create: (data: any) => api.post('/posts', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/posts/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/posts/${id}`).then(res => res.data),
    comment: (id: string, content: string) => api.post(`/posts/${id}/comment`, { content }).then(res => res.data),
    like: (id: string) => api.post(`/posts/${id}/like`).then(res => res.data),
};

export const healthApi = {
    addRecord: (akitaId: string, record: any) => api.post(`/akitas/${akitaId}/health-records`, record).then(res => res.data),
    updateRecord: (akitaId: string, recordId: string, data: any) => api.put(`/akitas/${akitaId}/health-records/${recordId}`, data).then(res => res.data),
    deleteRecord: (akitaId: string, recordId: string) => api.delete(`/akitas/${akitaId}/health-records/${recordId}`).then(res => res.data),
};

export const eventApi = {
    getAll: (filters?: any) => api.get('/events', { params: filters }).then(res => res.data),
    getById: (id: string) => api.get(`/events/${id}`).then(res => res.data),
    create: (data: any) => api.post('/events', data).then(res => res.data),
    update: (id: string, data: any) => api.put(`/events/${id}`, data).then(res => res.data),
    delete: (id: string) => api.delete(`/events/${id}`).then(res => res.data),
    rsvp: (id: string, status: string) => api.post(`/events/${id}/rsvp`, { status }).then(res => res.data),
    removeRsvp: (id: string) => api.delete(`/events/${id}/rsvp`).then(res => res.data),
};

export const notificationsApi = {
    getAll: (userId: string) => api.get(`/notifications?userId=${userId}`).then(res => res.data),
    getUnreadCount: (userId: string) => api.get(`/notifications/unread-count?userId=${userId}`).then(res => res.data),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`).then(res => res.data),
    markAllAsRead: (userId: string) => api.put('/notifications/read-all', { userId }).then(res => res.data),
    delete: (id: string) => api.delete(`/notifications/${id}`).then(res => res.data),
};

export const searchApi = {
    search: (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`).then(res => res.data),
};

export const marketplaceApi = {
    search: (filters: { location?: string, status?: string }) => {
        const params = new URLSearchParams();
        if (filters.location) params.append('location', filters.location);
        if (filters.status) params.append('status', filters.status);
        return api.get(`/marketplace?${params.toString()}`).then(res => res.data);
    },
};
