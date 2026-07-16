-- Backoffice V2 étape 2 : devis. Compteur de numérotation en base (pas de
-- COUNT(*), qui est sujet aux race conditions) partagé entre devis et
-- futures factures. L'incrément se fait via un UPSERT atomique
-- (ON CONFLICT ... RETURNING), et l'assignation du numéro se fait dans un
-- trigger BEFORE INSERT : si l'insert échoue, toute la transaction
-- (numéro compris) est annulée ensemble, donc pas de "trou" créé par une
-- tentative avortée.

create table public.admin_numerotation (
  type text not null check (type in ('devis', 'facture')),
  annee int not null,
  dernier_numero int not null default 0,
  primary key (type, annee)
);

alter table public.admin_numerotation enable row level security;

create policy admin_numerotation_owner_only
  on public.admin_numerotation
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

create function public.admin_next_numero(p_type text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_annee  int := extract(year from now())::int;
  v_num    int;
  v_prefix text;
begin
  if auth.uid() is distinct from 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid then
    raise exception 'Accès refusé.';
  end if;

  insert into public.admin_numerotation (type, annee, dernier_numero)
  values (p_type, v_annee, 1)
  on conflict (type, annee)
  do update set dernier_numero = admin_numerotation.dernier_numero + 1
  returning dernier_numero into v_num;

  v_prefix := case p_type when 'devis' then 'DEV' when 'facture' then 'FACT' else upper(p_type) end;

  return v_prefix || '-' || v_annee || '-' || lpad(v_num::text, 3, '0');
end;
$function$;

revoke execute on function public.admin_next_numero(text) from public, anon;
grant execute on function public.admin_next_numero(text) to authenticated, service_role;

create table public.admin_devis (
  id uuid primary key default gen_random_uuid(),
  numero text unique,
  client_id uuid not null references public.admin_clients(id) on delete restrict,
  lignes jsonb not null default '[]'::jsonb,
  total_ht numeric not null default 0,
  statut text not null default 'brouillon'
    check (statut in ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  date_validite date,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_devis enable row level security;

create policy admin_devis_owner_only
  on public.admin_devis
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

create function public.set_devis_numero_and_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.numero is null then
    new.numero := public.admin_next_numero('devis');
  end if;
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_devis_numero
  before insert on public.admin_devis
  for each row execute function public.set_devis_numero_and_updated_at();

create function public.set_devis_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_devis_updated_at
  before update on public.admin_devis
  for each row execute function public.set_devis_updated_at();
