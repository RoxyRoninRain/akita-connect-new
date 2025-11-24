import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider, useStore } from '../src/context/StoreContext';
import { threadApi, conversationApi } from '../src/api/client'; // Adjust import if needed, conversationApi is in conversations.ts
import { conversationApi as convApi } from '../src/api/conversations';

// Mock the APIs
vi.mock('../src/api/client', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        threadApi: {
            getAll: vi.fn().mockResolvedValue([]),
            create: vi.fn(),
            reply: vi.fn(),
        },
        userApi: {
            getAll: vi.fn().mockResolvedValue([{ id: 'user1', name: 'Test User', email: 'test@example.com', role: 'user', joined_date: new Date().toISOString(), dogs: [] }]),
            getById: vi.fn().mockResolvedValue({ id: 'user1', name: 'Test User', email: 'test@example.com', role: 'user', joined_date: new Date().toISOString(), dogs: [] }),
        },
        akitaApi: {
            getAll: vi.fn().mockResolvedValue([]),
        },
        litterApi: {
            getAll: vi.fn().mockResolvedValue([]),
        },
        postApi: {
            getAll: vi.fn().mockResolvedValue([]),
        },
        eventApi: {
            getAll: vi.fn().mockResolvedValue([]),
        },
    };
});

vi.mock('../src/api/conversations', () => ({
    conversationApi: {
        sendMessage: vi.fn(),
        getAll: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock('../src/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user1' } } } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
    },
}));

describe('Image Upload Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should pass images to threadApi.create', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => <StoreProvider>{children}</StoreProvider>;
        const { result } = renderHook(() => useStore(), { wrapper });

        // Wait for initial load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Mock create response
        (threadApi.create as any).mockResolvedValue({
            id: 'thread1',
            author_id: 'user1',
            title: 'Test Thread',
            content: 'Content',
            images: ['img1.jpg', 'img2.jpg'],
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
        });

        await act(async () => {
            await result.current.addThread({
                category: 'General',
                title: 'Test Thread',
                content: 'Content',
                images: ['img1.jpg', 'img2.jpg'],
                tags: [],
                authorId: 'user1'
            });
        });

        expect(threadApi.create).toHaveBeenCalledWith(expect.objectContaining({
            images: ['img1.jpg', 'img2.jpg']
        }));
    });

    it('should pass images to threadApi.reply', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => <StoreProvider>{children}</StoreProvider>;
        const { result } = renderHook(() => useStore(), { wrapper });

        // Wait for initial load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Mock reply response
        (threadApi.reply as any).mockResolvedValue({
            id: 'reply1',
            author_id: 'user1',
            content: 'Reply Content',
            images: ['reply.jpg'],
            created_at: new Date().toISOString(),
        });

        await act(async () => {
            await result.current.addThreadReply('thread1', 'Reply Content', ['reply.jpg']);
        });

        expect(threadApi.reply).toHaveBeenCalledWith('thread1', expect.objectContaining({
            images: ['reply.jpg']
        }));
    });
});
