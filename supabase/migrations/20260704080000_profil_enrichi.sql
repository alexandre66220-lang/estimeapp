-- Enrichissement profil artisan

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS photo_profil          TEXT,
  ADD COLUMN IF NOT EXISTS certifications        TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS annees_experience     INT,
  ADD COLUMN IF NOT EXISTS liens_sociaux         JSONB       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS statut_disponibilite  TEXT        NOT NULL DEFAULT 'disponible',
  ADD COLUMN IF NOT EXISTS statut_jusqu_au       DATE,
  ADD COLUMN IF NOT EXISTS presentation          TEXT,
  ADD COLUMN IF NOT EXISTS numero_siret          TEXT,
  ADD COLUMN IF NOT EXISTS slug_personnalise      TEXT        UNIQUE,
  ADD COLUMN IF NOT EXISTS theme_couleur         TEXT        NOT NULL DEFAULT '#C75D3B',
  ADD COLUMN IF NOT EXISTS langue_interface      TEXT        NOT NULL DEFAULT 'fr';

-- Index pour la recherche de slug personnalisé
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug_personnalise
  ON profiles (slug_personnalise)
  WHERE slug_personnalise IS NOT NULL;
