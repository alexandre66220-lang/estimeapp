-- CRM clients ALCALSPARK (backoffice perso, V2 étape 1). Même isolation
-- stricte que les tables admin_* existantes (admin_ca_manuel,
-- admin_factures) : RLS verrouillé sur l'UUID exact du compte admin,
-- jamais sur "authenticated" en général.

create table public.admin_clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  entreprise text,
  email text,
  telephone text,
  statut text not null default 'prospect'
    check (statut in ('prospect', 'devis_envoye', 'signe', 'en_cours', 'livre')),
  notes text,
  derniere_interaction timestamptz,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_clients enable row level security;

create policy admin_clients_owner_only
  on public.admin_clients
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

-- updated_at maintenu automatiquement à chaque modification
create function public.set_admin_clients_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_clients_updated_at
  before update on public.admin_clients
  for each row execute function public.set_admin_clients_updated_at();
