-- Backoffice V2 étape 3 : factures. La table admin_factures existait déjà
-- (V1, saisie manuelle libre client_nom/montant, 0 ligne en prod à ce
-- jour) : on la fait évoluer vers un schéma complet lié au CRM
-- (admin_clients) et aux devis (admin_devis), avec numérotation légale
-- séquentielle (même mécanisme atomique que les devis, cf.
-- admin_next_numero()).

alter table public.admin_factures
  drop column client_nom,
  drop column montant;

alter table public.admin_factures
  add column numero text unique,
  add column client_id uuid references public.admin_clients(id) on delete restrict,
  add column devis_id uuid references public.admin_devis(id) on delete set null,
  add column lignes jsonb not null default '[]'::jsonb,
  add column total_ht numeric not null default 0,
  add column total_ttc numeric not null default 0,
  add column date_echeance date,
  add column date_paiement date,
  add column updated_at timestamptz not null default now();

-- Le client est obligatoire pour une facture légale (aucune ligne
-- existante, donc pas de migration de données à faire).
alter table public.admin_factures
  alter column client_id set not null;

create function public.set_facture_numero_and_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.numero is null then
    new.numero := public.admin_next_numero('facture');
  end if;
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_factures_numero
  before insert on public.admin_factures
  for each row execute function public.set_facture_numero_and_updated_at();

create function public.set_facture_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_factures_updated_at
  before update on public.admin_factures
  for each row execute function public.set_facture_updated_at();

-- admin_ca_manuel (V1, saisie manuelle du CA du mois) est vide et
-- remplacé par un calcul automatique depuis les vraies factures.
drop table public.admin_ca_manuel;
