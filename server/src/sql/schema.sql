
-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. THREADS TABLE
create table if not exists threads (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) not null,
  category text not null,
  title text not null,
  content text not null,
  views integer default 0,
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. POSTS TABLE (Community Feed)
create table if not exists posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) not null,
  content text not null,
  images text[],
  created_at timestamptz default now()
);

-- 3. COMMENTS TABLE (Polymorphic-ish: can belong to thread OR post)
create table if not exists comments (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) not null,
  content text not null,
  thread_id uuid references threads(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  constraint comment_target_check check (
    (thread_id is not null and post_id is null) or
    (thread_id is null and post_id is not null)
  )
);

-- 4. LIKES TABLE
create table if not exists likes (
  user_id uuid references profiles(id) not null,
  post_id uuid references posts(id) on delete cascade,
  thread_id uuid references threads(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id, thread_id, comment_id), -- Composite PK might be tricky with nulls, better to use unique constraints
  constraint like_target_check check (
    (post_id is not null and thread_id is null and comment_id is null) or
    (post_id is null and thread_id is not null and comment_id is null) or
    (post_id is null and thread_id is null and comment_id is not null)
  )
);

-- RLS POLICIES

-- Threads
alter table threads enable row level security;
create policy "Threads are viewable by everyone" on threads for select using (true);
create policy "Users can create threads" on threads for insert with check (auth.uid() = author_id);
create policy "Users can update own threads" on threads for update using (auth.uid() = author_id);

-- Posts
alter table posts enable row level security;
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Users can create posts" on posts for insert with check (auth.uid() = author_id);

-- Comments
alter table comments enable row level security;
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Users can create comments" on comments for insert with check (auth.uid() = author_id);

-- Likes
alter table likes enable row level security;
create policy "Likes are viewable by everyone" on likes for select using (true);
create policy "Users can insert likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on likes for delete using (auth.uid() = user_id);
