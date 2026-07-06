ALTER TABLE chantiers
  ADD COLUMN IF NOT EXISTS date_debut DATE,
  ADD COLUMN IF NOT EXISTS date_fin   DATE;

CREATE INDEX IF NOT EXISTS chantiers_date_debut_idx ON chantiers (user_id, date_debut);
