import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Démo badge Estime",
};

export default async function BadgeDemo({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  const svgUrl = userId ? `/api/badge/${userId}/svg` : null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-dusk/10 px-6 py-5 flex items-center justify-between max-w-4xl mx-auto">
        <p className="font-display text-lg font-bold text-dusk">Dupont Rénovation</p>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-dusk/60">
          <span>Services</span>
          <span>Réalisations</span>
          <span>Contact</span>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-dusk mb-3">
          Votre artisan de confiance
        </h1>
        <p className="text-dusk/55 max-w-[60ch] mb-10">
          Exemple de page artisan avec le badge Estime intégré dans le pied de page,
          comme il apparaîtrait sur un vrai site.
        </p>
        <div className="h-px bg-dusk/10 mb-10" />
        <p className="text-dusk/40 text-sm">Contenu de la page...</p>
      </main>

      <footer className="border-t border-dusk/10 px-6 py-10 max-w-4xl mx-auto flex flex-col items-start gap-4">
        <p className="text-dusk/40 text-xs">© Dupont Rénovation — tous droits réservés</p>
        {svgUrl ? (
          <a href="https://estime-app.com" target="_blank" rel="noopener noreferrer">
            <Image src={svgUrl} alt="Badge Estime" width={320} height={120} unoptimized />
          </a>
        ) : (
          <p className="text-dusk/40 text-xs">
            Aucun badge à prévisualiser, revenez depuis la page &quot;Mon Badge&quot; de votre espace.
          </p>
        )}
      </footer>
    </div>
  );
}
