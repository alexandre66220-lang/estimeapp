import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ConnexionForm } from "@/components/ConnexionForm";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Connexion — Estime",
  description:
    "Connectez-vous à votre espace artisan Estime pour gérer vos chantiers et votre réputation en ligne.",
};

export default function Connexion() {
  return (
    <main className="min-h-screen bg-dust flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="sr-only">Connexion à votre espace Estime</h1>
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-dusk tracking-tight"
          >
            Estime
          </Link>
        </div>

        <Suspense fallback={<ConnexionFormSkeleton />}>
          <ConnexionForm />
        </Suspense>

        <p className="text-center text-dusk/50 text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="text-ambre font-medium hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}

function ConnexionFormSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-dusk/8 animate-pulse">
      <div className="h-7 w-32 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-48 bg-dusk/8 rounded mb-6" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-full" />
    </div>
  );
}
