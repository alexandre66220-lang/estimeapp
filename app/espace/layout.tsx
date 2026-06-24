import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  await ensureProfile(supabase, user);

  return <>{children}</>;
}
