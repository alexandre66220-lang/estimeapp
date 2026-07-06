-- ── Table clients : colonnes CRM ──────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_statut') THEN
    CREATE TYPE client_statut AS ENUM (
      'prospect', 'devis_envoye', 'chantier_en_cours', 'termine', 'perdu'
    );
  END IF;
END $$;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS statut client_statut NOT NULL DEFAULT 'prospect',
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS est_vip BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS derniere_interaction TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS montant_estime NUMERIC(10,2);

-- ── Table notes_client ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notes_client (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenu     TEXT NOT NULL CHECK (char_length(contenu) <= 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notes_client ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_client_owner" ON notes_client;
CREATE POLICY "notes_client_owner" ON notes_client
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Table chantiers : lien client + montant ────────────────────────────────

ALTER TABLE chantiers
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS montant NUMERIC(10,2);

-- Index pour les lookups client → chantiers
CREATE INDEX IF NOT EXISTS chantiers_client_id_idx ON chantiers (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notes_client_client_id_idx ON notes_client (client_id, created_at DESC);
