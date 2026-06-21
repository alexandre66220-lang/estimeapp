import type { Metadata } from "next";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Inscription - Estime",
  description: "Créez votre compte Estime.",
};

export default async function Inscription({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-dust flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-dusk tracking-tight"
          >
            Estime
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-dusk/8">
          <h1 className="font-display text-2xl font-bold text-dusk mb-1">
            Créer un compte
          </h1>
          <p className="text-dusk/50 text-sm mb-6">
            Rejoignez Estime en quelques secondes.
          </p>

          {error && (
            <p className="mb-5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </p>
          )}

          <form action={signup} className="space-y-5">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-dusk/70 mb-1.5"
              >
                Nom de l&apos;entreprise
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                required
                autoComplete="organization"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
                placeholder="Dupont Rénovation"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dusk/70 mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
                placeholder="jean@exemple.fr"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dusk/70 mb-1.5"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
                placeholder="6 caractères minimum"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
            >
              Créer mon compte
            </button>
          </form>
        </div>

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
