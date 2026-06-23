-- Email delivery log with duplicate-send prevention via dedupe_key
CREATE TABLE IF NOT EXISTS email_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  email               text not null,
  type                text not null,
  status              text not null default 'pending',
  dedupe_key          text not null unique,
  subject             text,
  provider_message_id text,
  error               text,
  sent_at             timestamptz,
  created_at          timestamptz default now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies — admin reads via service-role client only

CREATE INDEX IF NOT EXISTS email_logs_type_status_idx ON email_logs(type, status);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx ON email_logs(sent_at DESC);
