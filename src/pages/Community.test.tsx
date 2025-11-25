import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Community } from './Community';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock StoreContext
const mockAddThread = vi.fn();
const mockUseStore = vi.fn(() => ({
    threads: [],
    users: [],
    currentUser: { id: 'user1', name: 'Test User', role: 'owner' },
    addThread: mockAddThread,
    categories: ['General', 'Health'],
    toggleThreadLike: vi.fn(),
    toggleThreadPin: vi.fn(),
}));

vi.mock('../context/StoreContext', () => ({
    useStore: () => mockUseStore(),
}));

// Mock AuthGate
vi.mock('../components/AuthGate', () => ({
    AuthGate: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock ImageUpload
vi.mock('../components/common/ImageUpload', () => ({
    ImageUpload: ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => (
        <button type="button" onClick={() => {
            console.log('Mock ImageUpload clicked');
            onUploadSuccess('http://mock-image.com/test.jpg');
        }}>
            Upload Mock Image
        </button>
    ),
}));

describe('Community Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders "New Thread" button', () => {
        render(
            <BrowserRouter>
                <Community />
            </BrowserRouter>
        );
        expect(screen.getByText('New Thread')).toBeInTheDocument();
    });

    it('opens modal on "New Thread" click', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Community />
            </BrowserRouter>
        );
        await user.click(screen.getByText('New Thread'));
        expect(screen.getByText('Create New Thread')).toBeInTheDocument();
    });

    it('allows creating a thread with an image', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Community />
            </BrowserRouter>
        );

        // Open modal
        await user.click(screen.getByText('New Thread'));

        // Fill form
        await user.type(screen.getByPlaceholderText("What's your topic?"), 'Test Thread');
        await user.type(screen.getByPlaceholderText("Share your thoughts..."), 'Test Content');

        // Toggle image upload section
        await user.click(screen.getByTitle('Attach image'));

        // Upload image
        console.log('Clicking Upload Mock Image');
        await user.click(screen.getByText('Upload Mock Image'));

        // Verify image preview (mocked logic in component uses the URL)
        await waitFor(() => {
            expect(screen.getByAltText('Upload 1')).toBeInTheDocument();
        });

        // Submit
        await user.click(screen.getByText('Create Thread'));

        // Verify addThread call
        expect(mockAddThread).toHaveBeenCalledWith({
            authorId: 'user1',
            category: 'General',
            title: 'Test Thread',
            content: 'Test Content',
            tags: [],
            images: ['http://mock-image.com/test.jpg']
        });
    });
});
