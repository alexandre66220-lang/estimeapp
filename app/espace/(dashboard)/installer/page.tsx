import type { Metadata } from "next";
import { InstallGuide } from "@/components/espace/InstallGuide";
import { WidgetInstallGuide } from "@/components/espace/WidgetInstallGuide";
import { PlanningNotifBanner } from "@/components/espace/PlanningNotifBanner";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Installer Estime - Espace artisan",
  robots: { index: false },
};

export default async function InstallerPage() {
  const { user } = await getCurrentUser();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">
          Installez Estime sur votre téléphone
        </h1>
        <p className="text-dusk/50 text-sm mt-1">
          Accédez à Estime comme une vraie application, directement depuis votre écran d&apos;accueil.
        </p>
      </div>
      <div className="space-y-6">
        <InstallGuide />
        {user && <WidgetInstallGuide userId={user.id} />}
        <div>
          <h2 className="font-display text-xl font-bold text-dusk mb-2">Activer les notifications</h2>
          <p className="text-dusk/50 text-sm mb-4">
            Recevez une alerte push quand c&apos;est l&apos;heure de publier un post programmé.
          </p>
          <PlanningNotifBanner />
        </div>
      </div>
    </div>
  );
}
