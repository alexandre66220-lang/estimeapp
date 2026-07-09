import { Suspense } from "react";
import Sidebar from "@/components/espace/Sidebar";
import TrialBanner from "@/components/espace/TrialBanner";
import { PointsToastProvider } from "@/components/espace/PointsToastProvider";
import { QuickDock } from "@/components/espace/QuickDock";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBillingStatus, getCachedProfile } from "@/lib/supabase/profile";

const VALID_THEME_COLORS = ["#C75D3B", "#385144", "#2D4A6B", "#7B2D3E", "#C8922A", "#3D3D3D"];

async function ThemeInjector() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;
  const profile = await getCachedProfile<{ theme_couleur: string | null }>(
    supabase,
    user.id,
    "theme_couleur"
  );
  const color = profile?.theme_couleur ?? "#C75D3B";
  const safe = VALID_THEME_COLORS.includes(color) ? color : "#C75D3B";
  return <style>{`:root { --color-accent: ${safe}; }`}</style>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dust overflow-x-hidden">
      <Suspense fallback={null}>
        <ThemeInjector />
      </Suspense>
      <Sidebar />

      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] bg-ambre/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] bg-mauve/[0.06] rounded-full blur-3xl" />
      </div>

      <PointsToastProvider>
        <div className="lg:pl-64 pt-16 lg:pt-0">
          {/* Le shell (Sidebar + contenu) s'affiche sans attendre le statut de
              facturation : la bannière d'essai apparaît dès que la requête
              profile résout, sans bloquer le premier rendu. */}
          <Suspense fallback={null}>
            <TrialBannerSection />
          </Suspense>
          <main>{children}</main>
        </div>
        <Suspense fallback={null}>
          <QuickDockSection />
        </Suspense>
      </PointsToastProvider>
    </div>
  );
}

async function QuickDockSection() {
  const { supabase, user } = await getCurrentUser();
  if (!user) return null;

  const { data: chantiersListe } = await supabase
    .from("chantiers")
    .select("id, titre")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const chantiers = (chantiersListe ?? []).map((c: { id: string; titre: string | null }) => ({
    id: c.id,
    titre: c.titre ?? "Chantier sans titre",
  }));

  return <QuickDock chantiers={chantiers} />;
}

async function TrialBannerSection() {
  const { supabase, user } = await getCurrentUser();
  const profile = await getBillingStatus(supabase, user!.id);

  return (
    <TrialBanner
      trialEnd={profile?.trial_end ?? null}
      isSubscribed={profile?.is_subscribed ?? false}
    />
  );
}
