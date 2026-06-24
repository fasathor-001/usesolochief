-- Migration 011: WhatsApp OTP table for number verification

CREATE TABLE IF NOT EXISTS whatsapp_otps (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       text        NOT NULL,
  otp_hash    text        NOT NULL,
  expires_at  timestamptz NOT NULL,
  used        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_otps ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS — accessed only via service-role client

CREATE INDEX IF NOT EXISTS whatsapp_otps_user_id_idx  ON whatsapp_otps(user_id);
CREATE INDEX IF NOT EXISTS whatsapp_otps_phone_idx    ON whatsapp_otps(phone);
CREATE INDEX IF NOT EXISTS whatsapp_otps_expires_at_idx ON whatsapp_otps(expires_at);
