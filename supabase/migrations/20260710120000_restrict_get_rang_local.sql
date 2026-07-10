-- CRITIQUE (audit sécurité) : get_rang_local(p_user_id) est SECURITY DEFINER,
-- accessible à anon ET authenticated via RPC, sans aucune vérification que
-- p_user_id correspond à l'appelant. Un visiteur non authentifié pouvait
-- donc lire le score/rang d'un artisan quelconque ET forcer une écriture
-- (UPDATE profiles) sur sa ligne en passant n'importe quel uuid. RLS ne
-- protège pas ce cas car SECURITY DEFINER bypass les policies.
--
-- Fix : révoque l'exécution pour PUBLIC (dont anon hérite), regrant
-- explicitement authenticated + service_role, et ajoute une vérification
-- d'appartenance pour les appels authenticated. Le client admin
-- (service_role, utilisé par app/api/rapports/generer) continue de
-- fonctionner normalement (auth.role() y renvoie 'service_role').

revoke execute on function public.get_rang_local(uuid) from public;
grant execute on function public.get_rang_local(uuid) to authenticated, service_role;

create or replace function public.get_rang_local(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
DECLARE
  v_metier        TEXT;
  v_ville         TEXT;
  v_score         NUMERIC;
  v_nb_local      INT;
  v_nb_national   INT;
  v_rang          INT;
  v_percentile    NUMERIC;
  v_score_moyen   NUMERIC;
  v_scope         TEXT;
BEGIN
  IF auth.role() = 'authenticated' AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Accès refusé : vous ne pouvez consulter que votre propre classement.';
  END IF;

  -- Données de l'artisan courant
  SELECT pr.metier, pr.ville, COALESCE(pr.score_actuel, 0)
  INTO v_metier, v_ville, v_score
  FROM profiles pr
  WHERE pr.id = p_user_id;

  -- Tentative scope local (metier + ville, >= 3 artisans)
  IF v_metier IS NOT NULL AND v_ville IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_nb_local
    FROM profiles pr
    WHERE pr.metier = v_metier
      AND pr.ville   = v_ville
      AND pr.is_subscribed = true;

    IF v_nb_local >= 3 THEN
      SELECT
        COUNT(*) FILTER (WHERE pr.score_actuel > v_score) + 1,
        ROUND(
          (COUNT(*) FILTER (WHERE pr.score_actuel < v_score))::NUMERIC
          / v_nb_local * 100, 1
        ),
        ROUND(AVG(COALESCE(pr.score_actuel, 0))::NUMERIC, 1)
      INTO v_rang, v_percentile, v_score_moyen
      FROM profiles pr
      WHERE pr.metier = v_metier
        AND pr.ville   = v_ville
        AND pr.is_subscribed = true;

      v_scope := 'local';

      UPDATE profiles SET
        rang_local           = v_rang,
        percentile_local     = v_percentile,
        nb_artisans_compares = v_nb_local,
        score_moyen_local    = v_score_moyen,
        scope_comparaison    = v_scope
      WHERE id = p_user_id;

      RETURN jsonb_build_object(
        'rang',       v_rang,
        'nb_total',   v_nb_local,
        'percentile', v_percentile,
        'score_moyen',v_score_moyen,
        'scope',      v_scope,
        'metier',     v_metier,
        'ville',      v_ville
      );
    END IF;
  END IF;

  -- Fallback national (même métier)
  IF v_metier IS NOT NULL THEN
    SELECT COUNT(*) INTO v_nb_national
    FROM profiles pr
    WHERE pr.metier = v_metier AND pr.is_subscribed = true;

    IF v_nb_national >= 1 THEN
      SELECT
        COUNT(*) FILTER (WHERE pr.score_actuel > v_score) + 1,
        ROUND(
          (COUNT(*) FILTER (WHERE pr.score_actuel < v_score))::NUMERIC
          / NULLIF(v_nb_national, 0) * 100, 1
        ),
        ROUND(AVG(COALESCE(pr.score_actuel, 0))::NUMERIC, 1)
      INTO v_rang, v_percentile, v_score_moyen
      FROM profiles pr
      WHERE pr.metier = v_metier AND pr.is_subscribed = true;

      v_scope := 'national';

      UPDATE profiles SET
        rang_local           = v_rang,
        percentile_local     = v_percentile,
        nb_artisans_compares = v_nb_national,
        score_moyen_local    = v_score_moyen,
        scope_comparaison    = v_scope
      WHERE id = p_user_id;

      RETURN jsonb_build_object(
        'rang',       v_rang,
        'nb_total',   v_nb_national,
        'percentile', v_percentile,
        'score_moyen',v_score_moyen,
        'scope',      v_scope,
        'metier',     v_metier,
        'ville',      v_ville
      );
    END IF;
  END IF;

  -- Pioneer : pas assez d'artisans comparables
  UPDATE profiles SET
    rang_local           = 1,
    percentile_local     = NULL,
    nb_artisans_compares = 1,
    score_moyen_local    = v_score,
    scope_comparaison    = 'pioneer'
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'rang',       1,
    'nb_total',   1,
    'percentile', NULL,
    'score_moyen',v_score,
    'scope',      'pioneer',
    'metier',     v_metier,
    'ville',      v_ville
  );
END;
$function$;
