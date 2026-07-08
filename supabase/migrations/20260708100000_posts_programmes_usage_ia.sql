-- Table posts_programmes : planning éditorial
CREATE TABLE IF NOT EXISTS posts_programmes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chantier_id uuid REFERENCES chantiers(id) ON DELETE SET NULL,
  texte_post  text NOT NULL,
  hashtags    text[] DEFAULT '{}',
  image_url   text,
  date_publication timestamptz NOT NULL,
  statut      text NOT NULL DEFAULT 'programme' CHECK (statut IN ('programme', 'publie', 'annule')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts_programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_programmes_user" ON posts_programmes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_posts_programmes_user_date
  ON posts_programmes (user_id, date_publication)
  WHERE statut = 'programme';

-- Table usage_ia : limite de générations d'images par jour
CREATE TABLE IF NOT EXISTS usage_ia (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date            date NOT NULL DEFAULT CURRENT_DATE,
  images_generees integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

ALTER TABLE usage_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_ia_user" ON usage_ia
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
