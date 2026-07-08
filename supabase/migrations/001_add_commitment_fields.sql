-- ============================================================
-- Migration 001: Add commitment fields required for core product logic
-- Run after the base schema.sql
-- ============================================================

alter table commitments
  add column if not exists category        text not null default 'admin',
  add column if not exists permission_level text not null default 'protected_block',
  add column if not exists next_action     text,
  add column if not exists last_touched_at timestamptz,
  add column if not exists deleted_at      timestamptz;

create index if not exists idx_commitments_category         on commitments (category);
create index if not exists idx_commitments_stage            on commitments (stage);
create index if not exists idx_commitments_permission_level on commitments (permission_level);
create index if not exists idx_commitments_deleted_at       on commitments (deleted_at);
