-- Clean up old OTP table
drop table if exists whatsapp_otp_codes;

-- New table for connection tokens
create table whatsapp_connect_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null default now() + interval '15 minutes',
  used boolean not null default false,
  used_at timestamptz,
  failed_attempts integer not null default 0,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now()
);

create index whatsapp_connect_tokens_lookup_idx
  on whatsapp_connect_tokens(token_hash)
  where used = false;

create index whatsapp_connect_tokens_user_idx
  on whatsapp_connect_tokens(user_id, created_at desc);

-- New columns on profiles
alter table profiles add column if not exists whatsapp_connected boolean not null default false;
alter table profiles add column if not exists whatsapp_connected_at timestamptz;
alter table profiles add column if not exists whatsapp_disconnected_at timestamptz;
alter table profiles add column if not exists whatsapp_notifications_enabled boolean not null default true;
