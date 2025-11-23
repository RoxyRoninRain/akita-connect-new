
// const fetch = require('node-fetch'); // Using global fetch

const SUPABASE_URL = 'https://yxlxgmrkzljqdehubxza.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHhnbXJremxqcWRlaHVieHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzUwMjgsImV4cCI6MjA3OTMxMTAyOH0.gUFz4u1kkxqnlgIh7H9lZRLX6pYCpXdNhQoP2Vzv6V4';
const API_URL = 'http://localhost:3000/api';

async function testForum() {
    try {
        // 1. Login
        console.log('Logging in...');
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'password123'
            })
        });

        const authData = await authResponse.json();
        if (!authResponse.ok) throw new Error(`Login failed: ${JSON.stringify(authData)}`);

        const token = authData.access_token;
        const userId = authData.user.id;
        console.log('Login successful.');

        // 2. Create Thread
        console.log('Creating Thread...');
        const threadResponse = await fetch(`${API_URL}/threads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                author_id: userId,
                category: 'General',
                title: 'Test Thread via API',
                content: 'This is a test thread content.'
            })
        });
        const thread = await threadResponse.json();
        if (!threadResponse.ok) {
            console.error('Full Error Response:', JSON.stringify(thread, null, 2));
            throw new Error(`Failed to create thread: ${thread.error || 'Unknown error'}`);
        }
        console.log('Thread created:', thread.id);

        // 3. Reply to Thread
        console.log('Replying to Thread...');
        const replyResponse = await fetch(`${API_URL}/threads/${thread.id}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                author_id: userId,
                content: 'This is a test reply.'
            })
        });
        const reply = await replyResponse.json();
        if (!replyResponse.ok) {
            console.error('Reply Error:', JSON.stringify(reply, null, 2));
            throw new Error(`Failed to reply: ${reply.error || 'Unknown error'}`);
        }
        console.log('Reply added:', reply.id);

        // 4. Create Post (Feed)
        console.log('Creating Feed Post...');
        const postResponse = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                author_id: userId,
                content: 'Hello World from API Feed!',
                images: []
            })
        });
        const post = await postResponse.json();
        if (!postResponse.ok) {
            console.error('Post Error:', JSON.stringify(post, null, 2));
            throw new Error(`Failed to create post: ${post.error || 'Unknown error'}`);
        }
        console.log('Post created:', post.id);

        // 5. Comment on Post
        console.log('Commenting on Post...');
        const commentResponse = await fetch(`${API_URL}/posts/${post.id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                author_id: userId,
                content: 'Nice post!'
            })
        });
        const comment = await commentResponse.json();
        if (!commentResponse.ok) {
            const fs = require('fs');
            fs.writeFileSync('error.log', JSON.stringify(comment, null, 2));
            console.error('Comment Error logged to error.log');
            throw new Error(`Failed to comment: ${comment.error || 'Unknown error'}`);
        }
        console.log('Comment added:', comment.id);

        // 6. Like Post
        console.log('Liking Post...');
        const likeResponse = await fetch(`${API_URL}/posts/${post.id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                user_id: userId
            })
        });
        const likeData = await likeResponse.json();
        if (!likeResponse.ok) {
            console.error('Like Error:', JSON.stringify(likeData, null, 2));
            throw new Error(`Failed to like: ${likeData.error || 'Unknown error'}`);
        }
        console.log('Like toggled:', likeData);

        console.log('✅ Forum tests passed!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testForum();
