-- Feedback table for user-submitted feedback and feature requests
CREATE TABLE IF NOT EXISTS feedback (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  email        text,
  type         text not null,
  message      text not null,
  page         text,
  status       text not null default 'new',
  created_at   timestamptz default now(),
  reviewed_at  timestamptz,
  reviewed_by  text
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own feedback only
CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No SELECT policy for regular users — admin reads via service-role client which bypasses RLS
