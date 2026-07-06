-- Colonne slug unique sur les profils artisans
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Index pour les lookups rapides par slug
CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_idx ON profiles (slug) WHERE slug IS NOT NULL;
