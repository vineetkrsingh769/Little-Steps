# Little Steps

Trusted 24×7 childcare platform: parents search, compare and book verified crèches and daycare centers; providers manage their centers, caregivers and booking requests; admins approve centers and verify caregivers.

Built with TanStack Start (React), Tailwind CSS and Supabase (Postgres + Auth), deployed on Vercel.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Create the database.** In the Supabase dashboard → SQL Editor, run each file in `supabase/migrations/` in order, then `supabase/seed.sql` for the 20 demo centers. Or with the [Supabase CLI](https://supabase.com/docs/guides/cli):
   ```sh
   supabase link --project-ref YOUR-PROJECT-REF
   supabase db push --include-seed
   ```
3. **Configure environment.** Copy `.env.example` to `.env` and fill in your project URL and publishable (anon) key from Project Settings → API.
4. **Auth settings** (Supabase → Authentication):
   - URL Configuration: set Site URL to your deployed URL and add `http://localhost:3000` to Redirect URLs.
   - Google sign-in (optional): enable the Google provider with a Google Cloud OAuth client. Google sign-ins create parent accounts.
5. **Run it:**
   ```sh
   npm install
   npm run dev
   ```

The first account to sign up becomes the admin, so register with your own email first.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build (Vercel output)
- `npm test` — tests
- `npm run lint` — lint

## Deploying to Vercel

Import the repository in Vercel and add the four variables from `.env.example` in Project Settings → Environment Variables. The build is already configured for Vercel.
