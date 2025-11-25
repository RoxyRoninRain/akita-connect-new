# Production Seed Script

To add demo data to your production database:

1. **Update the seed script** to use your production Supabase credentials
2. **Run the seed script**

## Steps:

1. Open `server/src/seed.ts` (already exists)

2. Make sure your `server/.env` has your **production** Supabase credentials:
   ```
   SUPABASE_URL=your-production-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
   ```

3. Run the seed:
   ```bash
   cd server
   npm run seed
   ```

This will create:
- 3 test users (Sarah Jenkins - breeder, Kenji Tanaka - user, Admin Mod - moderator)
- 2 Akitas
- 1 litter

**Note:** The seed script uses `upsert` so you can run it multiple times safely.
