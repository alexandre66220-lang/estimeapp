import { Suspense } from "react";
import Sidebar from "@/components/espace/Sidebar";
import TrialBanner from "@/components/espace/TrialBanner";
import { FAB } from "@/components/espace/FAB";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBillingStatus } from "@/lib/supabase/profile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      <div className="lg:pl-64 pt-16 lg:pt-0">
        {/* Le shell (Sidebar + contenu) s'affiche sans attendre le statut de
            facturation : la bannière d'essai apparaît dès que la requête
            profile résout, sans bloquer le premier rendu. */}
        <Suspense fallback={null}>
          <TrialBannerSection />
        </Suspense>
        <main>{children}</main>
      </div>
      <FAB />
    </div>
  );
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
