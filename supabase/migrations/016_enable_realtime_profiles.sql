-- Enable Realtime publication for profiles table
-- This allows Supabase Realtime subscriptions to receive postgres_changes
-- events when the profiles table is updated (e.g., whatsapp_connected field)
--
-- Required because:
-- - WhatsApp webhook uses service role key to update profiles
-- - Realtime subscriptions in Settings and Onboarding need to detect these updates
-- - The profiles table must be in the supabase_realtime publication
--
-- Run this migration with: supabase migration up
-- Or manually in Supabase SQL Editor if migrations not available

-- Add profiles table to the supabase_realtime publication
-- This enables real-time updates for the profiles table
alter publication supabase_realtime add table profiles;

-- Verify the publication includes profiles table
-- SELECT schemaname, tablename FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime' AND tablename = 'profiles';
