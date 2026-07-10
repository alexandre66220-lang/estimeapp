-- ÉLEVÉ (audit sécurité) : les buckets chantiers, profiles, materiau-scans
-- et notes-vocales n'avaient aucune limite de taille ni de type MIME au
-- niveau du bucket. Pour "chantiers" en particulier, l'upload se fait
-- directement depuis le navigateur (AjouterPhotoChantierModal.tsx) sans
-- passer par une route serveur qui valide le fichier : seule la policy
-- RLS de storage.objects vérifie l'appartenance (chemin user_id/...), pas
-- le contenu. Un artisan authentifié pouvait donc uploader un fichier de
-- type ou de taille arbitraire (abus de stockage, fichier non-image, etc).
-- Les autres buckets sont déjà validés côté route/action Next.js ; ceci
-- ajoute une défense en profondeur au niveau du bucket lui-même.

update storage.buckets
set file_size_limit = 10485760, -- 10 Mo
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic']
where id = 'chantiers';

update storage.buckets
set file_size_limit = 5242880, -- 5 Mo
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'profiles';

update storage.buckets
set file_size_limit = 10485760, -- 10 Mo
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic']
where id = 'materiau-scans';

update storage.buckets
set file_size_limit = 10485760, -- 10 Mo
    allowed_mime_types = array['audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/wav']
where id = 'notes-vocales';
