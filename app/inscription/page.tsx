import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { InscriptionForm } from "@/components/InscriptionForm";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Inscription gratuite — Estime",
  description:
    "Créez votre compte Estime gratuitement. 14 jours d'essai sans carte bancaire.",
  alternates: {
    canonical: "/inscription",
  },
};

export default function Inscription() {
  return (
    <main className="min-h-screen bg-dust flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="sr-only">Créer votre compte Estime gratuit</h1>
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-dusk tracking-tight"
          >
            Estime
          </Link>
        </div>

        <Suspense fallback={<InscriptionFormSkeleton />}>
          <InscriptionForm />
        </Suspense>

        <p className="text-center text-dusk/50 text-sm mt-6">
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="text-ambre font-medium hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}

function InscriptionFormSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-dusk/8 animate-pulse">
      <div className="h-7 w-40 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-52 bg-dusk/8 rounded mb-6" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-full" />
    </div>
  );
}
