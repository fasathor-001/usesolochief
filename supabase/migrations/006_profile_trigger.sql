-- Update handle_new_user to capture full_name from signup metadata.
-- Email/password signup passes full_name via options.data; magic-link signup
-- passes nothing, so full_name defaults to NULL (safe).
-- Run in Supabase SQL Editor after deploying email/password auth.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
