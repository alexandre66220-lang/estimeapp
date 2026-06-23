import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import Sidebar from "@/components/espace/Sidebar";

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

  return (
    <div className="min-h-screen bg-dust">
      <Sidebar />

      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] bg-ambre/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] bg-mauve/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="lg:pl-64">
        <main className="pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
