-- 1. FOLLOWS TABLE
create table if not exists follows (
  follower_id uuid references profiles(id) not null,
  following_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- 2. SETTINGS COLUMNS (in profiles)
alter table profiles add column if not exists notify_likes boolean default true;
alter table profiles add column if not exists notify_comments boolean default true;
alter table profiles add column if not exists notify_follows boolean default true;
alter table profiles add column if not exists show_email boolean default false;
alter table profiles add column if not exists show_phone boolean default false;

-- 3. RLS FOR FOLLOWS
alter table follows enable row level security;

create policy "Follows are viewable by everyone" 
  on follows for select using (true);

create policy "Users can follow others" 
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" 
  on follows for delete using (auth.uid() = follower_id);
