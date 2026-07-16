-- Dépenses ALCALSPARK, pour la vue rentabilité de /backoffice/finances
create table public.admin_depenses (
  id uuid primary key default gen_random_uuid(),
  categorie text not null,
  montant numeric not null default 0,
  date date not null default current_date,
  note text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.admin_depenses enable row level security;

create policy admin_depenses_owner_only on public.admin_depenses
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

-- Feature flags perso, pour tester une feature Estime uniquement sur le
-- compte admin avant de la déployer pour tous les utilisateurs.
create table public.admin_feature_flags (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  description text,
  actif_pour_moi boolean not null default false,
  actif_global boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_feature_flags enable row level security;

create policy admin_feature_flags_owner_only on public.admin_feature_flags
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

create or replace function public.set_admin_feature_flags_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_admin_feature_flags_updated_at
  before update on public.admin_feature_flags
  for each row execute function public.set_admin_feature_flags_updated_at();
