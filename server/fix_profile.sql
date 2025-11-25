-- Check if your auth user has a profile
-- Replace 'YOUR_EMAIL_HERE' with your actual email

-- Step 1: Find your auth user ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: Check if profile exists (use the ID from step 1)
SELECT * 
FROM public.profiles 
WHERE id = 'USER_ID_FROM_STEP_1';

-- Step 3: If no profile exists, create it (replace the values)
INSERT INTO public.profiles (id, email, name, avatar, role)
VALUES (
    'USER_ID_FROM_STEP_1',
    'YOUR_EMAIL_HERE',
    'Your Name',
    'https://ui-avatars.com/api/?name=Your+Name&background=random',
    'enthusiast'
)
ON CONFLICT (id) DO NOTHING;
