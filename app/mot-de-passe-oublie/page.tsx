import type { Metadata } from "next";
import Link from "next/link";
import { MotDePasseOublieForm } from "@/components/MotDePasseOublieForm";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Mot de passe oublié, Estime",
  description:
    "Recevez un lien par email pour réinitialiser le mot de passe de votre compte Estime.",
  alternates: {
    canonical: "/mot-de-passe-oublie",
  },
  robots: { index: false, follow: false },
};

export default function MotDePasseOublie() {
  return (
    <main className="min-h-screen bg-dust flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="sr-only">Mot de passe oublié</h1>
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-dusk tracking-tight"
          >
            Estime
          </Link>
        </div>

        <MotDePasseOublieForm />

        <p className="text-center text-dusk/50 text-sm mt-6">
          <Link
            href="/connexion"
            className="text-ambre font-medium hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
