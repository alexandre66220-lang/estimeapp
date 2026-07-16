-- Schéma dédié au backoffice personnel ALCALSPARK (/backoffice), totalement
-- séparé des tables Estime existantes. Préfixe "admin_" pour identifier
-- clairement ces tables comme hors périmètre de l'app publique.
--
-- RLS : chaque table n'autorise l'accès qu'à un unique user_id (le compte
-- admin personnel), jamais au rôle "authenticated" en général. Aucun
-- artisan Estime, même connecté, ne peut lire ou écrire dans ces tables.

create table public.admin_ca_manuel (
  id uuid primary key default gen_random_uuid(),
  mois text not null, -- format 'YYYY-MM'
  montant numeric not null,
  note text,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (mois)
);

create table public.admin_factures (
  id uuid primary key default gen_random_uuid(),
  client_nom text not null,
  montant numeric not null,
  statut text not null check (statut in ('payee', 'envoyee', 'en_retard')),
  date_emission date not null default current_date,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.admin_ca_manuel enable row level security;
alter table public.admin_factures enable row level security;

-- Policy verrouillée sur l'UUID exact du compte admin personnel
-- (spark@alcalspark.com), pas sur le rôle authenticated en général.
create policy admin_ca_manuel_owner_only
  on public.admin_ca_manuel
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

create policy admin_factures_owner_only
  on public.admin_factures
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);
