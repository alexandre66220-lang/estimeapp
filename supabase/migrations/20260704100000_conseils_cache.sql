CREATE TABLE IF NOT EXISTS conseils_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metier      TEXT NOT NULL DEFAULT '',
  contenu     JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE conseils_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON conseils_cache
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conseils_cache_user ON conseils_cache (user_id);
CREATE INDEX IF NOT EXISTS idx_conseils_cache_generated ON conseils_cache (generated_at);
