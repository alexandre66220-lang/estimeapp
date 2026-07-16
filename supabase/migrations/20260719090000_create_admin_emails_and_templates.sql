-- Backoffice V3 étape 2 : emailing. Même isolation stricte que les
-- autres tables admin_* : RLS verrouillé sur l'UUID exact du compte
-- admin.

create table public.admin_email_templates (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  sujet text not null,
  corps text not null default '',
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_email_templates enable row level security;

create policy admin_email_templates_owner_only
  on public.admin_email_templates
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

create function public.set_admin_email_templates_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_email_templates_updated_at
  before update on public.admin_email_templates
  for each row execute function public.set_admin_email_templates_updated_at();

create table public.admin_emails (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.admin_clients(id) on delete cascade,
  sujet text not null,
  corps text not null,
  statut text not null check (statut in ('envoye', 'echec')),
  erreur text,
  date_envoi timestamptz not null default now(),
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;

create policy admin_emails_owner_only
  on public.admin_emails
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

-- Templates de départ
insert into public.admin_email_templates (titre, sujet, corps, created_by)
select 'Bienvenue', 'Bienvenue chez ALCALSPARK', E'Bonjour {{client_nom}},\n\nMerci de votre confiance ! Nous sommes ravis de démarrer cette collaboration.\n\nJe reviens vers vous très prochainement avec les prochaines étapes.\n\nÀ bientôt,\nAlexandre — ALCALSPARK', id
from auth.users where email = 'spark@alcalspark.com' limit 1;

insert into public.admin_email_templates (titre, sujet, corps, created_by)
select 'Relance devis', 'Suivi de votre devis {{client_nom}}', E'Bonjour {{client_nom}},\n\nJe me permets de revenir vers vous concernant le devis que je vous ai transmis récemment. Avez-vous eu l''occasion de le consulter ?\n\nJe reste disponible pour toute question ou ajustement.\n\nBien cordialement,\nAlexandre — ALCALSPARK', id
from auth.users where email = 'spark@alcalspark.com' limit 1;

insert into public.admin_email_templates (titre, sujet, corps, created_by)
select 'Suivi de projet', 'Point d''avancement, {{client_nom}}', E'Bonjour {{client_nom}},\n\nVoici un point rapide sur l''avancement du projet en cours.\n\n[À compléter]\n\nN''hésitez pas à revenir vers moi si vous avez des questions.\n\nBien cordialement,\nAlexandre — ALCALSPARK', id
from auth.users where email = 'spark@alcalspark.com' limit 1;
