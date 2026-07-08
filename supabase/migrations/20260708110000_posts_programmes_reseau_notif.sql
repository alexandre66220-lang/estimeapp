ALTER TABLE posts_programmes
  ADD COLUMN IF NOT EXISTS reseau_social text DEFAULT 'instagram' CHECK (reseau_social IN ('instagram', 'facebook', 'tiktok')),
  ADD COLUMN IF NOT EXISTS notification_envoyee boolean NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS push_subscription jsonb DEFAULT NULL;
