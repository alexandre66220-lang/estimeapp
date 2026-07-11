-- FAIBLE (audit sécurité) : sync_points_total() est une fonction trigger
-- (RETURNS trigger) exposée via /rest/v1/rpc/sync_points_total à anon et
-- authenticated alors qu'elle ne doit s'exécuter qu'en tant que trigger
-- interne sur points_fidelite. Un appel RPC direct échoue déjà nativement
-- (Postgres refuse d'invoquer une fonction trigger hors contexte de
-- trigger), mais on retire l'accès public par hygiène / défense en
-- profondeur : le trigger continue de fonctionner normalement (son
-- exécution ne passe pas par les privilèges EXECUTE du rôle appelant).

revoke execute on function public.sync_points_total() from public, anon, authenticated;
