import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { ensureProfile, processFirstLogin } from "@/lib/supabase/profile";

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
    await processFirstLogin(supabase, user);
  }

  return <>{children}</>;
}
