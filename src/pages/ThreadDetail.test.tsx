import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThreadDetail } from './ThreadDetail';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock useParams
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: 'thread1' }),
    };
});

// Mock StoreContext
const mockAddThreadReply = vi.fn();
const mockToggleThreadLike = vi.fn();
const mockToggleThreadPin = vi.fn();

const mockThread = {
    id: 'thread1',
    authorId: 'user1',
    category: 'General',
    title: 'Test Thread',
    content: 'Test Content',
    replies: [],
    views: 10,
    lastActive: new Date().toISOString(),
    isPinned: false,
    tags: [],
    likesCount: 0,
    userHasLiked: false,
    images: ['http://mock-image.com/thread-image.jpg']
};

const mockUseStore = vi.fn(() => ({
    threads: [mockThread],
    users: [{ id: 'user1', name: 'Test User', avatar: 'avatar.jpg' }],
    currentUser: { id: 'user2', name: 'Replier', role: 'owner' },
    addThreadReply: mockAddThreadReply,
    toggleThreadLike: mockToggleThreadLike,
    toggleThreadPin: mockToggleThreadPin,
}));

vi.mock('../context/StoreContext', () => ({
    useStore: () => mockUseStore(),
}));

// Mock ImageUpload
vi.mock('../components/common/ImageUpload', () => ({
    ImageUpload: ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => (
        <button onClick={() => onUploadSuccess('http://mock-image.com/reply-image.jpg')}>
            Upload Reply Image
        </button>
    ),
}));

describe('ThreadDetail Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders thread content and images', () => {
        render(
            <BrowserRouter>
                <ThreadDetail />
            </BrowserRouter>
        );
        expect(screen.getByText('Test Thread')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.getByAltText('Thread image 1')).toBeInTheDocument();
    });

    it('allows attaching an image to a reply', async () => {
        render(
            <BrowserRouter>
                <ThreadDetail />
            </BrowserRouter>
        );

        // Click Attach Image
        fireEvent.click(screen.getByText('Attach Image'));

        // Upload image
        fireEvent.click(screen.getByText('Upload Reply Image'));

        // Verify image preview
        await waitFor(() => {
            expect(screen.getByAltText('Attachment 1')).toBeInTheDocument();
        });

        // Type reply
        fireEvent.change(screen.getByPlaceholderText('Write your reply...'), { target: { value: 'Test Reply' } });

        // Submit
        fireEvent.click(screen.getByText('Post Reply'));

        // Verify addThreadReply call
        expect(mockAddThreadReply).toHaveBeenCalledWith(
            'thread1',
            'Test Reply',
            ['http://mock-image.com/reply-image.jpg']
        );
    });
});
