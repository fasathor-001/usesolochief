-- Migration 016: WhatsApp Pro gating with trial and upgrade tracking
-- Adds trial tracking to profiles and creates upgrade prompt logging

-- Add trial columns to profiles table
alter table profiles add column if not exists whatsapp_trial_used boolean not null default false;
alter table profiles add column if not exists whatsapp_trial_started_at timestamptz;
alter table profiles add column if not exists whatsapp_trial_ends_at timestamptz;

-- Create table to log upgrade prompts for analytics
create table if not exists whatsapp_upgrade_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompted_at timestamptz not null default now(),
  prompt_location text not null
);

-- Index for analytics queries
create index if not exists whatsapp_upgrade_prompts_user_id_idx on whatsapp_upgrade_prompts(user_id);
create index if not exists whatsapp_upgrade_prompts_prompted_at_idx on whatsapp_upgrade_prompts(prompted_at);
