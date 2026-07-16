-- Backoffice V3 étape 1 : documents clients (templates réutilisables +
-- documents envoyés). Même isolation stricte que les autres tables
-- admin_* : RLS verrouillé sur l'UUID exact du compte admin.

create table public.admin_documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('template', 'envoye')),
  titre text not null,
  contenu text not null default '',
  client_id uuid references public.admin_clients(id) on delete set null,
  template_source_id uuid references public.admin_documents(id) on delete set null,
  date_envoi timestamptz,
  created_by uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_documents enable row level security;

create policy admin_documents_owner_only
  on public.admin_documents
  for all
  using (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid)
  with check (auth.uid() = 'dece2cb2-9f6e-4cba-89b1-7c5a35989ae2'::uuid);

create function public.set_admin_documents_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger trg_admin_documents_updated_at
  before update on public.admin_documents
  for each row execute function public.set_admin_documents_updated_at();

-- Template de départ : Welcome kit
insert into public.admin_documents (type, titre, contenu, created_by)
select
  'template',
  'Welcome kit',
  E'# Bienvenue chez ALCALSPARK\n\nBonjour {{client_nom}},\n\nNous sommes ravis de démarrer cette collaboration avec vous. Ce document résume les prochaines étapes de notre travail ensemble.\n\n## Prochaines étapes\n\n- Validation du devis et des prestations convenues\n- Planification du démarrage\n- Point d''avancement régulier\n\n## Contact\n\nPour toute question, vous pouvez nous joindre à contact@alcalspark.com.\n\nÀ très bientôt,\nL''équipe ALCALSPARK',
  id
from auth.users
where email = 'spark@alcalspark.com'
limit 1;
