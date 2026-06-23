-- ============================================================
-- SoloChief — Full Database Schema
-- RLS enabled on every table — no exceptions (D-007)
-- Run this in Supabase SQL editor to initialise the schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type daily_log_status as enum (
  'planned', 'confirmed', 'in_progress', 'done', 'partial',
  'blocked', 'slipped', 'switched', 'wrongly_touched', 'unknown', 'needs_review'
);

create type switch_request_decision as enum ('approved', 'blocked', 'pending');

create type check_in_type as enum ('morning_confirm', 'midday_check', 'end_day', 'friday_review');

create type status_source as enum (
  'user_whatsapp', 'user_web', 'user_corrected',
  'system_inferred', 'ai_suggested', 'ai_confirmed'
);

create type advice_confidence as enum ('high', 'medium', 'low');

create type commitment_event_type as enum (
  'stage_changed', 'permission_changed', 'wrongly_touched',
  'approved_switch', 'checklist_closed', 'parked', 'reactivated'
);

-- ============================================================
-- WORKSPACES
-- ============================================================

create table workspaces (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  slug         text not null unique,
  settings     jsonb not null default '{}'
);

create index idx_workspaces_user_id on workspaces (user_id);

alter table workspaces enable row level security;

create policy "Users can manage their own workspaces"
  on workspaces for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null unique references auth.users on delete cascade,
  workspace_id    uuid references workspaces on delete set null,
  full_name       text,
  avatar_url      text,
  timezone        text not null default 'Europe/London',
  onboarded_at    timestamptz
);

create index idx_profiles_user_id      on profiles (user_id);
create index idx_profiles_workspace_id on profiles (workspace_id);

alter table profiles enable row level security;

create policy "Users can manage their own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- COMMITMENTS
-- ============================================================

create table commitment_categories (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  user_id      uuid not null references auth.users on delete cascade,
  workspace_id uuid not null references workspaces on delete cascade,
  name         text not null,
  colour       text not null default '#00C2A8',
  sort_order   integer not null default 0
);

create index idx_commitment_categories_user_id      on commitment_categories (user_id);
create index idx_commitment_categories_workspace_id on commitment_categories (workspace_id);

alter table commitment_categories enable row level security;

create policy "Users can manage their own commitment categories"
  on commitment_categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table commitments (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  category_id     uuid references commitment_categories on delete set null,
  title           text not null,
  description     text,
  stage           text not null default 'active',
  priority        integer not null default 0,
  due_date        date,
  completed_at    timestamptz,
  parked_at       timestamptz,
  metadata        jsonb not null default '{}'
);

create index idx_commitments_user_id      on commitments (user_id);
create index idx_commitments_workspace_id on commitments (workspace_id);
create index idx_commitments_due_date     on commitments (due_date);

alter table commitments enable row level security;

create policy "Users can manage their own commitments"
  on commitments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- COMMITMENT EVENTS
-- ============================================================

create table commitment_events (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid not null references commitments on delete cascade,
  event_type      commitment_event_type not null,
  previous_value  text,
  new_value       text,
  notes           text,
  source          status_source not null default 'user_web'
);

create index idx_commitment_events_user_id       on commitment_events (user_id);
create index idx_commitment_events_workspace_id  on commitment_events (workspace_id);
create index idx_commitment_events_commitment_id on commitment_events (commitment_id);

alter table commitment_events enable row level security;

create policy "Users can manage their own commitment events"
  on commitment_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- WEEKLY PLANS
-- ============================================================

create table weekly_plans (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  user_id        uuid not null references auth.users on delete cascade,
  workspace_id   uuid not null references workspaces on delete cascade,
  week_start     date not null,
  theme          text,
  priorities     jsonb not null default '[]',
  notes          text,
  locked_at      timestamptz
);

create index idx_weekly_plans_user_id      on weekly_plans (user_id);
create index idx_weekly_plans_workspace_id on weekly_plans (workspace_id);
create index idx_weekly_plans_week_start   on weekly_plans (week_start);

alter table weekly_plans enable row level security;

create policy "Users can manage their own weekly plans"
  on weekly_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- WEEKLY OUTCOMES
-- ============================================================

create table weekly_outcomes (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  user_id        uuid not null references auth.users on delete cascade,
  workspace_id   uuid not null references workspaces on delete cascade,
  weekly_plan_id uuid not null references weekly_plans on delete cascade,
  commitment_id  uuid references commitments on delete set null,
  description    text not null,
  achieved       boolean,
  notes          text
);

create index idx_weekly_outcomes_user_id       on weekly_outcomes (user_id);
create index idx_weekly_outcomes_workspace_id  on weekly_outcomes (workspace_id);
create index idx_weekly_outcomes_weekly_plan_id on weekly_outcomes (weekly_plan_id);

alter table weekly_outcomes enable row level security;

create policy "Users can manage their own weekly outcomes"
  on weekly_outcomes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- STOP LIST ITEMS
-- ============================================================

create table stop_list_items (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  user_id        uuid not null references auth.users on delete cascade,
  workspace_id   uuid not null references workspaces on delete cascade,
  description    text not null,
  reason         text,
  active         boolean not null default true,
  resolved_at    timestamptz
);

create index idx_stop_list_items_user_id      on stop_list_items (user_id);
create index idx_stop_list_items_workspace_id on stop_list_items (workspace_id);

alter table stop_list_items enable row level security;

create policy "Users can manage their own stop list items"
  on stop_list_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- DAILY FOCUS
-- ============================================================

create table daily_focus (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid not null references commitments on delete cascade,
  focus_date      date not null,
  sort_order      integer not null default 0,
  confirmed       boolean not null default false,
  confirmed_at    timestamptz
);

create index idx_daily_focus_user_id       on daily_focus (user_id);
create index idx_daily_focus_workspace_id  on daily_focus (workspace_id);
create index idx_daily_focus_focus_date    on daily_focus (focus_date);

alter table daily_focus enable row level security;

create policy "Users can manage their own daily focus"
  on daily_focus for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- NOT TODAY ITEMS
-- ============================================================

create table not_today_items (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid references commitments on delete cascade,
  description     text not null,
  blocked_date    date not null,
  reason          text
);

create index idx_not_today_items_user_id      on not_today_items (user_id);
create index idx_not_today_items_workspace_id on not_today_items (workspace_id);
create index idx_not_today_items_blocked_date on not_today_items (blocked_date);

alter table not_today_items enable row level security;

create policy "Users can manage their own not-today items"
  on not_today_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- LAUNCH CHECKLISTS
-- ============================================================

create table launch_checklists (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid references commitments on delete set null,
  title           text not null,
  description     text,
  closed_at       timestamptz,
  closed_by       status_source
);

create index idx_launch_checklists_user_id      on launch_checklists (user_id);
create index idx_launch_checklists_workspace_id on launch_checklists (workspace_id);

alter table launch_checklists enable row level security;

create policy "Users can manage their own launch checklists"
  on launch_checklists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table launch_checklist_items (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  checklist_id    uuid not null references launch_checklists on delete cascade,
  title           text not null,
  done            boolean not null default false,
  done_at         timestamptz,
  sort_order      integer not null default 0,
  notes           text
);

create index idx_launch_checklist_items_user_id      on launch_checklist_items (user_id);
create index idx_launch_checklist_items_workspace_id on launch_checklist_items (workspace_id);
create index idx_launch_checklist_items_checklist_id on launch_checklist_items (checklist_id);

alter table launch_checklist_items enable row level security;

create policy "Users can manage their own launch checklist items"
  on launch_checklist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- PARKING LOT ITEMS
-- ============================================================

create table parking_lot_items (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid references commitments on delete set null,
  title           text not null,
  description     text,
  parked_at       date not null default current_date,
  reactivated_at  timestamptz,
  notes           text
);

create index idx_parking_lot_items_user_id      on parking_lot_items (user_id);
create index idx_parking_lot_items_workspace_id on parking_lot_items (workspace_id);
create index idx_parking_lot_items_parked_at    on parking_lot_items (parked_at);

alter table parking_lot_items enable row level security;

create policy "Users can manage their own parking lot items"
  on parking_lot_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FOLLOWUPS
-- ============================================================

create table followups (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid references commitments on delete set null,
  title           text not null,
  description     text,
  due_date        date,
  completed_at    timestamptz,
  contact_name    text,
  contact_ref     text
);

create index idx_followups_user_id      on followups (user_id);
create index idx_followups_workspace_id on followups (workspace_id);
create index idx_followups_due_date     on followups (due_date);

alter table followups enable row level security;

create policy "Users can manage their own follow-ups"
  on followups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- REVIEWS
-- ============================================================

create table reviews (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  weekly_plan_id  uuid references weekly_plans on delete set null,
  review_date     date not null,
  review_type     check_in_type not null default 'friday_review',
  summary         text,
  energy_rating   integer check (energy_rating between 1 and 5),
  focus_rating    integer check (focus_rating between 1 and 5),
  completed_at    timestamptz
);

create index idx_reviews_user_id      on reviews (user_id);
create index idx_reviews_workspace_id on reviews (workspace_id);
create index idx_reviews_review_date  on reviews (review_date);

alter table reviews enable row level security;

create policy "Users can manage their own reviews"
  on reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table review_items (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  review_id       uuid not null references reviews on delete cascade,
  commitment_id   uuid references commitments on delete set null,
  description     text not null,
  outcome         daily_log_status,
  notes           text
);

create index idx_review_items_user_id      on review_items (user_id);
create index idx_review_items_workspace_id on review_items (workspace_id);
create index idx_review_items_review_id    on review_items (review_id);

alter table review_items enable row level security;

create policy "Users can manage their own review items"
  on review_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AI MESSAGES
-- ============================================================

create table ai_messages (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  confidence      advice_confidence,
  thread_id       uuid,
  tokens_used     integer,
  model           text
);

create index idx_ai_messages_user_id      on ai_messages (user_id);
create index idx_ai_messages_workspace_id on ai_messages (workspace_id);
create index idx_ai_messages_thread_id    on ai_messages (thread_id);
create index idx_ai_messages_created_at  on ai_messages (created_at);

alter table ai_messages enable row level security;

create policy "Users can manage their own AI messages"
  on ai_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AI ACTIONS
-- ============================================================

create table ai_actions (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  message_id      uuid references ai_messages on delete set null,
  action_type     text not null,
  payload         jsonb not null default '{}',
  status          text not null default 'proposed' check (status in ('proposed', 'validated', 'applied', 'rejected')),
  validated_at    timestamptz,
  applied_at      timestamptz,
  rejection_note  text
);

-- AI never writes directly to database (D-008) — actions are proposed and validated first
create index idx_ai_actions_user_id      on ai_actions (user_id);
create index idx_ai_actions_workspace_id on ai_actions (workspace_id);
create index idx_ai_actions_message_id   on ai_actions (message_id);
create index idx_ai_actions_status       on ai_actions (status);

alter table ai_actions enable row level security;

create policy "Users can manage their own AI actions"
  on ai_actions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AGENT RUNS
-- ============================================================

create table agent_runs (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  run_type        text not null,
  status          text not null default 'running' check (status in ('running', 'completed', 'failed')),
  input           jsonb not null default '{}',
  output          jsonb,
  error           text,
  tokens_used     integer,
  completed_at    timestamptz
);

create index idx_agent_runs_user_id      on agent_runs (user_id);
create index idx_agent_runs_workspace_id on agent_runs (workspace_id);
create index idx_agent_runs_status       on agent_runs (status);
create index idx_agent_runs_created_at   on agent_runs (created_at);

alter table agent_runs enable row level security;

create policy "Users can manage their own agent runs"
  on agent_runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- SWITCH REQUESTS
-- ============================================================

create table switch_requests (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  user_id             uuid not null references auth.users on delete cascade,
  workspace_id        uuid not null references workspaces on delete cascade,
  from_commitment_id  uuid references commitments on delete set null,
  to_commitment_id    uuid references commitments on delete set null,
  reason              text,
  decision            switch_request_decision not null default 'pending',
  decided_at          timestamptz,
  decision_note       text,
  source              status_source not null default 'user_web'
);

create index idx_switch_requests_user_id      on switch_requests (user_id);
create index idx_switch_requests_workspace_id on switch_requests (workspace_id);
create index idx_switch_requests_decision     on switch_requests (decision);

alter table switch_requests enable row level security;

create policy "Users can manage their own switch requests"
  on switch_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CHECK-INS
-- ============================================================

create table check_ins (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  check_in_date   date not null,
  type            check_in_type not null,
  notes           text,
  completed_at    timestamptz,
  source          status_source not null default 'user_web'
);

create index idx_check_ins_user_id        on check_ins (user_id);
create index idx_check_ins_workspace_id   on check_ins (workspace_id);
create index idx_check_ins_check_in_date  on check_ins (check_in_date);

alter table check_ins enable row level security;

create policy "Users can manage their own check-ins"
  on check_ins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- DAILY LOGS
-- ============================================================

create table daily_logs (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid not null references commitments on delete cascade,
  log_date        date not null,
  status          daily_log_status not null default 'unknown',
  status_source   status_source not null default 'system_inferred',
  notes           text,
  time_spent_mins integer
);

create index idx_daily_logs_user_id      on daily_logs (user_id);
create index idx_daily_logs_workspace_id on daily_logs (workspace_id);
create index idx_daily_logs_log_date     on daily_logs (log_date);
create index idx_daily_logs_status       on daily_logs (status);

alter table daily_logs enable row level security;

create policy "Users can manage their own daily logs"
  on daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- BLOCKERS
-- ============================================================

create table blockers (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid references commitments on delete set null,
  description     text not null,
  blocked_date    date not null default current_date,
  resolved_at     timestamptz,
  resolution_note text
);

create index idx_blockers_user_id      on blockers (user_id);
create index idx_blockers_workspace_id on blockers (workspace_id);
create index idx_blockers_blocked_date on blockers (blocked_date);

alter table blockers enable row level security;

create policy "Users can manage their own blockers"
  on blockers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CORRECTIONS
-- ============================================================

create table corrections (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  target_table    text not null,
  target_id       uuid not null,
  field_name      text not null,
  old_value       text,
  new_value       text,
  reason          text,
  source          status_source not null default 'user_corrected'
);

create index idx_corrections_user_id      on corrections (user_id);
create index idx_corrections_workspace_id on corrections (workspace_id);
create index idx_corrections_target_id    on corrections (target_id);

alter table corrections enable row level security;

create policy "Users can manage their own corrections"
  on corrections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CONTEXT SNAPSHOTS
-- ============================================================

create table context_snapshots (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  snapshot_date   date not null,
  payload         jsonb not null default '{}',
  generated_at    timestamptz not null default now()
);

-- Context package loads before every AI call (D-010)
create index idx_context_snapshots_user_id       on context_snapshots (user_id);
create index idx_context_snapshots_workspace_id  on context_snapshots (workspace_id);
create index idx_context_snapshots_snapshot_date on context_snapshots (snapshot_date);

alter table context_snapshots enable row level security;

create policy "Users can manage their own context snapshots"
  on context_snapshots for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION PREFERENCES
-- ============================================================

create table notification_preferences (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null unique references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  morning_enabled boolean not null default true,
  morning_time    time not null default '08:00',
  midday_enabled  boolean not null default true,
  midday_time     time not null default '13:00',
  end_day_enabled boolean not null default true,
  end_day_time    time not null default '18:00',
  email_enabled   boolean not null default true,
  web_enabled     boolean not null default true
);

create index idx_notification_preferences_user_id      on notification_preferences (user_id);
create index idx_notification_preferences_workspace_id on notification_preferences (workspace_id);

alter table notification_preferences enable row level security;

create policy "Users can manage their own notification preferences"
  on notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION DELIVERIES
-- ============================================================

create table notification_deliveries (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  channel         text not null check (channel in ('email', 'web', 'whatsapp')),
  notification_type text not null,
  delivered_at    timestamptz,
  opened_at       timestamptz,
  failed_at       timestamptz,
  error           text,
  reference_id    uuid
);

create index idx_notification_deliveries_user_id      on notification_deliveries (user_id);
create index idx_notification_deliveries_workspace_id on notification_deliveries (workspace_id);
create index idx_notification_deliveries_created_at   on notification_deliveries (created_at);

alter table notification_deliveries enable row level security;

create policy "Users can manage their own notification deliveries"
  on notification_deliveries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- WHATSAPP CONNECTIONS (Phase 2 — schema ready)
-- ============================================================

create table whatsapp_connections (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null unique references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  phone_number    text,
  verified        boolean not null default false,
  verified_at     timestamptz,
  active          boolean not null default false
);

create index idx_whatsapp_connections_user_id      on whatsapp_connections (user_id);
create index idx_whatsapp_connections_workspace_id on whatsapp_connections (workspace_id);

alter table whatsapp_connections enable row level security;

create policy "Users can manage their own WhatsApp connection"
  on whatsapp_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- WORK LOGS
-- ============================================================

create table work_logs (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  commitment_id   uuid references commitments on delete set null,
  log_date        date not null default current_date,
  started_at      timestamptz,
  ended_at        timestamptz,
  duration_mins   integer,
  description     text,
  source          status_source not null default 'user_web'
);

create index idx_work_logs_user_id      on work_logs (user_id);
create index idx_work_logs_workspace_id on work_logs (workspace_id);
create index idx_work_logs_log_date     on work_logs (log_date);

alter table work_logs enable row level security;

create policy "Users can manage their own work logs"
  on work_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FOCUS CONFIRMATIONS
-- ============================================================

create table focus_confirmations (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users on delete cascade,
  workspace_id    uuid not null references workspaces on delete cascade,
  daily_focus_id  uuid not null references daily_focus on delete cascade,
  confirmed_at    timestamptz not null default now(),
  source          status_source not null default 'user_web',
  notes           text
);

create index idx_focus_confirmations_user_id       on focus_confirmations (user_id);
create index idx_focus_confirmations_workspace_id  on focus_confirmations (workspace_id);
create index idx_focus_confirmations_daily_focus_id on focus_confirmations (daily_focus_id);

alter table focus_confirmations enable row level security;

create policy "Users can manage their own focus confirmations"
  on focus_confirmations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables
create trigger set_updated_at before update on workspaces           for each row execute function handle_updated_at();
create trigger set_updated_at before update on profiles             for each row execute function handle_updated_at();
create trigger set_updated_at before update on commitment_categories for each row execute function handle_updated_at();
create trigger set_updated_at before update on commitments          for each row execute function handle_updated_at();
create trigger set_updated_at before update on commitment_events    for each row execute function handle_updated_at();
create trigger set_updated_at before update on weekly_plans         for each row execute function handle_updated_at();
create trigger set_updated_at before update on weekly_outcomes      for each row execute function handle_updated_at();
create trigger set_updated_at before update on stop_list_items      for each row execute function handle_updated_at();
create trigger set_updated_at before update on daily_focus          for each row execute function handle_updated_at();
create trigger set_updated_at before update on not_today_items      for each row execute function handle_updated_at();
create trigger set_updated_at before update on launch_checklists    for each row execute function handle_updated_at();
create trigger set_updated_at before update on launch_checklist_items for each row execute function handle_updated_at();
create trigger set_updated_at before update on parking_lot_items    for each row execute function handle_updated_at();
create trigger set_updated_at before update on followups            for each row execute function handle_updated_at();
create trigger set_updated_at before update on reviews              for each row execute function handle_updated_at();
create trigger set_updated_at before update on review_items         for each row execute function handle_updated_at();
create trigger set_updated_at before update on ai_messages          for each row execute function handle_updated_at();
create trigger set_updated_at before update on ai_actions           for each row execute function handle_updated_at();
create trigger set_updated_at before update on agent_runs           for each row execute function handle_updated_at();
create trigger set_updated_at before update on switch_requests      for each row execute function handle_updated_at();
create trigger set_updated_at before update on check_ins            for each row execute function handle_updated_at();
create trigger set_updated_at before update on daily_logs           for each row execute function handle_updated_at();
create trigger set_updated_at before update on blockers             for each row execute function handle_updated_at();
create trigger set_updated_at before update on corrections          for each row execute function handle_updated_at();
create trigger set_updated_at before update on context_snapshots    for each row execute function handle_updated_at();
create trigger set_updated_at before update on notification_preferences for each row execute function handle_updated_at();
create trigger set_updated_at before update on notification_deliveries  for each row execute function handle_updated_at();
create trigger set_updated_at before update on whatsapp_connections for each row execute function handle_updated_at();
create trigger set_updated_at before update on work_logs            for each row execute function handle_updated_at();
create trigger set_updated_at before update on focus_confirmations  for each row execute function handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
