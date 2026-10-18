/*
# Create Levelπ user profiles

1. New Tables
- `levelpi_users`: one profile per authenticated account.
- `id`: UUID matching the Supabase Auth user.
- `username`: unique public login name, stored lowercase.
- `created_at`: profile creation timestamp.

2. Security
- Enable row-level security on `levelpi_users`.
- Allow each signed-in user to read, create, update, and delete only their own profile.
- No email, provider, or external identity is stored in this application table; authentication remains handled by Supabase Auth with an internal account identifier.

3. Important Notes
- User-facing registration and login use username and password only.
- The username uniqueness constraint prevents duplicate accounts.
*/

CREATE TABLE IF NOT EXISTS public.levelpi_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT levelpi_users_username_format CHECK (username ~ '^[a-z0-9_]{3,20}$')
);

ALTER TABLE public.levelpi_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own Levelpi profile" ON public.levelpi_users;
CREATE POLICY "Users can read own Levelpi profile"
  ON public.levelpi_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own Levelpi profile" ON public.levelpi_users;
CREATE POLICY "Users can create own Levelpi profile"
  ON public.levelpi_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own Levelpi profile" ON public.levelpi_users;
CREATE POLICY "Users can update own Levelpi profile"
  ON public.levelpi_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own Levelpi profile" ON public.levelpi_users;
CREATE POLICY "Users can delete own Levelpi profile"
  ON public.levelpi_users FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
