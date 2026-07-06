-- Programme de fidélité gamifié

-- Table des points
CREATE TABLE IF NOT EXISTS points_fidelite (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action      TEXT          NOT NULL,
  points      INT           NOT NULL CHECK (points > 0),
  meta        JSONB         NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pts_user_created
  ON points_fidelite(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pts_user_action
  ON points_fidelite(user_id, action);

ALTER TABLE points_fidelite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON points_fidelite
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Colonnes profil
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS points_total        INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS niveau              TEXT        NOT NULL DEFAULT 'apprenti',
  ADD COLUMN IF NOT EXISTS derniere_connexion  DATE,
  ADD COLUMN IF NOT EXISTS streak_jours        INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recompenses         JSONB       NOT NULL DEFAULT '[]';

-- Trigger : synchronise points_total + niveau après chaque insert
CREATE OR REPLACE FUNCTION sync_points_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total  INT;
  v_niveau TEXT;
BEGIN
  SELECT COALESCE(SUM(points), 0)
    INTO v_total
    FROM points_fidelite
   WHERE user_id = NEW.user_id;

  v_niveau := CASE
    WHEN v_total >= 2000 THEN 'legende'
    WHEN v_total >= 1000 THEN 'maitre'
    WHEN v_total >= 500  THEN 'expert'
    WHEN v_total >= 200  THEN 'confirme'
    ELSE                      'apprenti'
  END;

  UPDATE profiles
     SET points_total = v_total,
         niveau       = v_niveau
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_points ON points_fidelite;
CREATE TRIGGER trg_sync_points
  AFTER INSERT ON points_fidelite
  FOR EACH ROW
  EXECUTE FUNCTION sync_points_total();
