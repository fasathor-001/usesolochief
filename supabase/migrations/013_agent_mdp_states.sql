-- Agent Trust Engine — MDP state machine for the four built-in agents.
-- Run manually in Supabase SQL Editor after deployment.
-- Migration 013

CREATE TABLE IF NOT EXISTS agent_mdp_states (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name        text        NOT NULL CHECK (agent_name IN ('planning', 'focus', 'followup', 'review')),
  state             text        NOT NULL DEFAULT 'candidate' CHECK (state IN ('candidate', 'proving', 'valued', 'void')),
  correct_streak    int         NOT NULL DEFAULT 0,
  r0_count          int         NOT NULL DEFAULT 0,
  total_evaluations int         NOT NULL DEFAULT 0,
  last_evaluated_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_name)
);

ALTER TABLE agent_mdp_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own agent states"
  ON agent_mdp_states FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS agent_mdp_states_user_id_idx ON agent_mdp_states(user_id);
CREATE INDEX IF NOT EXISTS agent_mdp_states_state_idx ON agent_mdp_states(state);
CREATE INDEX IF NOT EXISTS agent_mdp_states_last_evaluated_idx ON agent_mdp_states(last_evaluated_at DESC NULLS LAST);

-- Seed trigger: insert 4 rows for every new user on signup.
CREATE OR REPLACE FUNCTION on_user_created_seed_mdp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO agent_mdp_states (user_id, agent_name)
  VALUES
    (NEW.id, 'planning'),
    (NEW.id, 'focus'),
    (NEW.id, 'followup'),
    (NEW.id, 'review')
  ON CONFLICT (user_id, agent_name) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_seed_mdp ON auth.users;
CREATE TRIGGER on_user_created_seed_mdp
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION on_user_created_seed_mdp();

-- Backfill: seed rows for every existing user who does not yet have agent_mdp_states rows.
INSERT INTO agent_mdp_states (user_id, agent_name)
SELECT u.id, a.name
FROM   auth.users u
CROSS  JOIN (VALUES ('planning'), ('focus'), ('followup'), ('review')) AS a(name)
ON CONFLICT (user_id, agent_name) DO NOTHING;
