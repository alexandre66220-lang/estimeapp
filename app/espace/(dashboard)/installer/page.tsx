import type { Metadata } from "next";
import { InstallGuide } from "@/components/espace/InstallGuide";

export const metadata: Metadata = {
  title: "Installer Estime - Espace artisan",
  robots: { index: false },
};

export default function InstallerPage() {
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
      <InstallGuide />
    </div>
  );
}
