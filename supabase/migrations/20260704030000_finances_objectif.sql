-- Objectif annuel sur le profil artisan
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objectif_annuel NUMERIC(12,2);

-- Index pour les agrégations financières
CREATE INDEX IF NOT EXISTS idx_chantiers_user_created
  ON chantiers(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chantiers_user_montant
  ON chantiers(user_id, montant)
  WHERE montant IS NOT NULL;
