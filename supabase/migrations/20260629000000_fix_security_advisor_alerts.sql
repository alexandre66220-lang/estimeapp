-- Corrections des alertes du Security Advisor Supabase.
-- Appliqué en base via l'éditeur SQL / MCP Supabase (project odkoiwtybpwergiiprdf),
-- ce fichier sert de trace versionnée du changement.

-- ALERTE 1 — Function Search Path Mutable
ALTER FUNCTION public.set_profile_trial_dates() SET search_path = public;

-- ALERTE 2 — Public Can Execute SECURITY DEFINER Functions
-- get_reputation_badge reste accessible en anon : elle est appelée sans
-- session par /api/badge/[userId] et /api/badge/[userId]/svg (badge public).
REVOKE EXECUTE ON FUNCTION public.get_reputation_badge(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_reputation_badge(uuid) TO anon, authenticated;

-- resolve_code_parrainage : aucun appel anon dans le code, PUBLIC et anon retirés.
REVOKE EXECUTE ON FUNCTION public.resolve_code_parrainage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_code_parrainage(text) TO authenticated;
