-- Migration 012: WhatsApp message log with duplicate-send prevention

CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  phone       text        NOT NULL,
  direction   text        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type        text        NOT NULL,
  dedupe_key  text        UNIQUE,
  status      text        NOT NULL DEFAULT 'sent',
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Do not log message body content — type and status only

ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS — accessed only via service-role client

CREATE INDEX IF NOT EXISTS whatsapp_logs_user_id_idx    ON whatsapp_logs(user_id);
CREATE INDEX IF NOT EXISTS whatsapp_logs_created_at_idx ON whatsapp_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_logs_type_idx       ON whatsapp_logs(type, status);
