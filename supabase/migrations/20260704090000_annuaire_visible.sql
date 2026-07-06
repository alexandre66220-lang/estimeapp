-- Annuaire public artisans

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS visible_annuaire BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_profiles_metier ON profiles (metier) WHERE metier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_ville  ON profiles (ville)  WHERE ville  IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_annuaire
  ON profiles (is_subscribed, visible_annuaire, score_actuel DESC)
  WHERE is_subscribed = true AND visible_annuaire = true;
