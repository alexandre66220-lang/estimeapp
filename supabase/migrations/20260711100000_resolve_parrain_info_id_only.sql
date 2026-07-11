-- MOYEN (audit sécurité) : resolve_parrain_info(p_code) est SECURITY
-- DEFINER et renvoyait l'email du parrain (via un join auth.users) à
-- n'importe quel utilisateur authentifié connaissant/devinant un code de
-- parrainage. Ne renvoie plus que ce qui est strictement nécessaire pour
-- valider l'insertion du parrainage : l'id du parrain.

drop function if exists public.resolve_parrain_info(text);

create function public.resolve_parrain_info(p_code text)
returns uuid
language sql
security definer
set search_path to 'public'
as $function$
  select id from public.profiles where code_parrainage = p_code limit 1;
$function$;

-- Les fonctions ont par défaut un GRANT EXECUTE explicite à anon côté
-- Supabase (indépendant de PUBLIC) : il faut le révoquer explicitement.
revoke execute on function public.resolve_parrain_info(text) from public, anon;
grant execute on function public.resolve_parrain_info(text) to authenticated, service_role;
