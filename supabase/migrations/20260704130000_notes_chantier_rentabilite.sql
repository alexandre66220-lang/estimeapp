-- ── Table notes_chantier ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notes_chantier (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chantier_id UUID NOT NULL REFERENCES chantiers(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenu     TEXT NOT NULL CHECK (char_length(contenu) <= 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_chantier_chantier_idx ON notes_chantier (chantier_id, created_at DESC);

ALTER TABLE notes_chantier ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_chantier_owner" ON notes_chantier
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── Colonnes rentabilité sur chantiers ────────────────────────────────────────

ALTER TABLE chantiers
  ADD COLUMN IF NOT EXISTS depenses         NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS heures_passees   NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS sous_traitance   NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS frais_deplacement NUMERIC(10,2);
