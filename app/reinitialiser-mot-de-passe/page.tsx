import type { Metadata } from "next";
import Link from "next/link";
import { ReinitialiserMotDePasseForm } from "@/components/ReinitialiserMotDePasseForm";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe, Estime",
  description: "Choisissez un nouveau mot de passe pour votre compte Estime.",
  alternates: {
    canonical: "/reinitialiser-mot-de-passe",
  },
  robots: { index: false, follow: false },
};

export default function ReinitialiserMotDePasse() {
  return (
    <main className="min-h-screen bg-dust flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="sr-only">Réinitialiser le mot de passe</h1>
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-dusk tracking-tight"
          >
            Estime
          </Link>
        </div>

        <ReinitialiserMotDePasseForm />
      </div>
    </main>
  );
}
