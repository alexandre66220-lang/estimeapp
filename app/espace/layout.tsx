import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { ensureProfile, processFirstLogin } from "@/lib/supabase/profile";
import { devError } from "@/lib/log";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  const profile = await ensureProfile(supabase, user);
  if (!profile || !profile.first_login_processed) {
    // processFirstLogin est idempotent (verrou atomique SQL sur
    // first_login_processed = false) : on peut le lancer sans await pour ne
    // pas bloquer le rendu du dashboard. Si la fonction est appelée deux
    // fois en parallèle, le second UPDATE ne trouve aucune ligne et sort
    // immédiatement sans effet de bord.
    processFirstLogin(supabase, user).catch((err) =>
      devError("processFirstLogin a échoué", err)
    );
  }

  return <>{children}</>;
}
