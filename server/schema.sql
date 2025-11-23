-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public user data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar text,
  role text default 'user', -- 'user', 'breeder', 'moderator'
  location text,
  bio text,
  website text,
  joined_date timestamp with time zone default timezone('utc'::text, now())
);

-- AKITAS
create table public.akitas (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id),
  registered_name text not null,
  call_name text not null,
  registration_number text,
  dob date,
  gender text check (gender in ('male', 'female')),
  color text,
  bio text,
  main_image text,
  images text[] default '{}',
  titles text[] default '{}',
  health_records jsonb default '[]'::jsonb,
  achievements text[] default '{}',
  sire_id uuid references public.akitas(id),
  dam_id uuid references public.akitas(id),
  pedigree_image text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- LITTERS
create table public.litters (
  id uuid default uuid_generate_v4() primary key,
  breeder_id uuid references public.profiles(id),
  sire_id uuid references public.akitas(id),
  dam_id uuid references public.akitas(id),
  dob date,
  status text default 'Available', -- 'Available', 'Reserved', 'Sold', 'Expecting'
  description text,
  price integer,
  location text,
  puppies jsonb default '[]'::jsonb,
  images text[] default '{}',
  approval_status text default 'pending', -- 'pending', 'approved', 'rejected'
  approved_by uuid references public.profiles(id),
  approval_date timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- FORUM THREADS
create table public.threads (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id),
  title text not null,
  content text not null,
  category text not null,
  views integer default 0,
  likes integer default 0,
  is_pinned boolean default false,
  is_locked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- FORUM COMMENTS
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  thread_id uuid references public.threads(id) on delete cascade,
  author_id uuid references public.profiles(id),
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- EVENTS
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references public.profiles(id),
  title text not null,
  description text,
  date timestamp with time zone not null,
  location text,
  type text, -- 'show', 'meetup', 'seminar'
  image text,
  attendees uuid[] default '{}', -- Array of profile IDs
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- POSTS (Feed)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id),
  content text,
  image text,
  likes integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Basic Setup - Enable RLS but allow public read for now)
alter table public.profiles enable row level security;
alter table public.akitas enable row level security;
alter table public.litters enable row level security;
alter table public.threads enable row level security;
alter table public.comments enable row level security;
alter table public.events enable row level security;
alter table public.posts enable row level security;

-- READ POLICIES (Public can read everything for now)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Akitas are viewable by everyone" on public.akitas for select using (true);
create policy "Litters are viewable by everyone" on public.litters for select using (true);
create policy "Threads are viewable by everyone" on public.threads for select using (true);
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Events are viewable by everyone" on public.events for select using (true);
create policy "Posts are viewable by everyone" on public.posts for select using (true);

-- WRITE POLICIES (Authenticated users can insert/update their own data)
-- Note: These are simplified. In production, you'd want stricter checks.
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can insert akitas" on public.akitas for insert with check (auth.role() = 'authenticated');
create policy "Owners can update akitas" on public.akitas for update using (auth.uid() = owner_id);

create policy "Breeders can insert litters" on public.litters for insert with check (auth.role() = 'authenticated'); -- Should check for breeder role ideally
create policy "Breeders can update own litters" on public.litters for update using (auth.uid() = breeder_id);

create policy "Users can insert threads" on public.threads for insert with check (auth.role() = 'authenticated');
create policy "Authors can update threads" on public.threads for update using (auth.uid() = author_id);

create policy "Users can insert comments" on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Authors can update comments" on public.comments for update using (auth.uid() = author_id);
