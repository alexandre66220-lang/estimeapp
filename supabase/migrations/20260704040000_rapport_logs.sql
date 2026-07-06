-- Table de logs pour les rapports mensuels générés
CREATE TABLE IF NOT EXISTS rapport_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mois         TEXT NOT NULL, -- "2026-07"
  pdf_url      TEXT,
  email_envoye BOOLEAN DEFAULT false,
  statut       TEXT NOT NULL DEFAULT 'success', -- 'success' | 'error'
  erreur       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rapport_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rapport_logs_owner"
  ON rapport_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_rapport_logs_user
  ON rapport_logs(user_id, created_at DESC);
