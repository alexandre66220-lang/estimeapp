-- Score comparatif local
-- Adds cached ranking columns to profiles and a SECURITY DEFINER RPC

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS score_actuel     NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS rang_local       INT,
  ADD COLUMN IF NOT EXISTS percentile_local NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS nb_artisans_compares INT,
  ADD COLUMN IF NOT EXISTS score_moyen_local NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS scope_comparaison TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_metier_ville
  ON profiles (metier, ville, is_subscribed)
  WHERE metier IS NOT NULL AND is_subscribed = true;

CREATE OR REPLACE FUNCTION get_rang_local(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_metier        TEXT;
  v_ville         TEXT;
  v_score         NUMERIC;
  v_rang          INT;
  v_nb_total      INT;
  v_percentile    NUMERIC;
  v_score_moyen   NUMERIC;
  v_scope         TEXT;
  v_result        JSONB;
BEGIN
  SELECT metier, ville, score_actuel
    INTO v_metier, v_ville, v_score
    FROM profiles
   WHERE id = p_user_id;

  IF v_score IS NULL THEN
    RETURN jsonb_build_object('scope', 'pioneer', 'rang', 1, 'nb_total', 1, 'percentile', 50, 'score_moyen', 0);
  END IF;

  -- Try local scope (same metier + ville, ≥ 3 artisans)
  SELECT COUNT(*)::INT, AVG(score_actuel)
    INTO v_nb_total, v_score_moyen
    FROM profiles
   WHERE metier = v_metier
     AND ville = v_ville
     AND is_subscribed = true
     AND score_actuel IS NOT NULL;

  IF v_nb_total >= 3 THEN
    v_scope := 'local';
    SELECT COUNT(*)::INT + 1 INTO v_rang
      FROM profiles
     WHERE metier = v_metier
       AND ville = v_ville
       AND is_subscribed = true
       AND score_actuel > v_score;
    v_percentile := ROUND(((v_nb_total - v_rang + 1)::NUMERIC / v_nb_total) * 100, 1);
  ELSE
    -- Fallback: national (same metier, ≥ 3)
    SELECT COUNT(*)::INT, AVG(score_actuel)
      INTO v_nb_total, v_score_moyen
      FROM profiles
     WHERE metier = v_metier
       AND is_subscribed = true
       AND score_actuel IS NOT NULL;

    IF v_nb_total >= 3 THEN
      v_scope := 'national';
      SELECT COUNT(*)::INT + 1 INTO v_rang
        FROM profiles
       WHERE metier = v_metier
         AND is_subscribed = true
         AND score_actuel > v_score;
      v_percentile := ROUND(((v_nb_total - v_rang + 1)::NUMERIC / v_nb_total) * 100, 1);
    ELSE
      v_scope := 'pioneer';
      v_rang := 1;
      v_nb_total := 1;
      v_percentile := 50;
      v_score_moyen := v_score;
    END IF;
  END IF;

  -- Cache result in profiles row
  UPDATE profiles SET
    rang_local            = v_rang,
    percentile_local      = v_percentile,
    nb_artisans_compares  = v_nb_total,
    score_moyen_local     = ROUND(v_score_moyen, 1),
    scope_comparaison     = v_scope
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'rang',        v_rang,
    'nb_total',    v_nb_total,
    'percentile',  v_percentile,
    'score_moyen', ROUND(v_score_moyen, 1),
    'scope',       v_scope
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_rang_local(UUID) TO authenticated, service_role;
