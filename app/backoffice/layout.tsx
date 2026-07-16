import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Backoffice personnel ALCALSPARK, complètement indépendant de l'app
 * Estime vue par les artisans (autre schéma de tables, autre DA, aucune
 * dépendance fonctionnelle).
 *
 * Protection volontairement stricte : verrouillée sur l'UUID exact d'un
 * seul compte, jamais sur "utilisateur authentifié" en général. Un
 * artisan connecté qui tente d'accéder à /backoffice tombe sur un 404
 * (pas de redirection vers /connexion qui confirmerait l'existence de
 * la route) avant qu'aucune donnée ne soit chargée.
 */
const ADMIN_USER_ID = "dece2cb2-9f6e-4cba-89b1-7c5a35989ae2"; // spark@alcalspark.com

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    notFound();
  }

  return <>{children}</>;
}
