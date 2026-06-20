import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { logout } from "@/app/actions/auth";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  await ensureProfile(supabase, user);

  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <header className="border-b border-charbon/8 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/espace/tableau-de-bord"
            className="font-display text-xl font-bold text-charbon tracking-tight"
          >
            Estime
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm font-medium text-charbon/60 hover:text-charbon transition-colors duration-200"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
