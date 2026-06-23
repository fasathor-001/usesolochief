-- Add billing columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_cancelled_at TIMESTAMPTZ;

-- Plan values: free, pro, operator, chief
-- Add index for polar customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_polar_customer_id
  ON profiles(polar_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_plan
  ON profiles(plan);
