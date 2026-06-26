import Sidebar from "@/components/espace/Sidebar";
import TrialBanner from "@/components/espace/TrialBanner";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBillingStatus } from "@/lib/supabase/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getCurrentUser();

  const profile = await getBillingStatus(supabase, user!.id);

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
        <TrialBanner
          trialEnd={profile?.trial_end ?? null}
          isSubscribed={profile?.is_subscribed ?? false}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
