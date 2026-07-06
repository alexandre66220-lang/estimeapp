-- Nouvelles colonnes financières sur les chantiers
ALTER TABLE chantiers
  ADD COLUMN IF NOT EXISTS autres_couts numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS taux_horaire_objectif numeric DEFAULT NULL;
