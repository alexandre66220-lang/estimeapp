"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LIEN_EXPIRE = "Ce lien a expiré. Faites une nouvelle demande.";

export function ReinitialiserMotDePasseForm() {
  const router = useRouter();
  const [checkingLink, setCheckingLink] = useState(true);
  const [linkExpired, setLinkExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase ajoute error/error_code dans l'URL (query ou hash) quand le
    // lien de récupération est expiré ou déjà utilisé.
    const params = new URLSearchParams(
      window.location.search || window.location.hash.replace(/^#/, "")
    );
    if (params.get("error") || params.get("error_code")) {
      setLinkExpired(true);
      setCheckingLink(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setCheckingLink(false);
      }
    });

    // Si l'échange du code de récupération a déjà eu lieu avant que ce
    // composant ne s'abonne, une session valide est déjà présente.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCheckingLink(false);
    });

    const timeout = setTimeout(() => setCheckingLink(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmation = formData.get("confirmation") as string;

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        if (/expired|expiré|invalid/i.test(updateError.message)) {
          setLinkExpired(true);
        } else {
          setError("Impossible de mettre à jour le mot de passe. Réessayez.");
        }
        return;
      }

      router.push(
        `/connexion?message=${encodeURIComponent("Mot de passe mis à jour, vous pouvez vous connecter.")}`
      );
    } catch {
      setError("Une erreur est survenue. Réessayez dans quelques instants.");
    } finally {
      setIsLoading(false);
    }
  }

  if (checkingLink) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-dusk/8 animate-pulse">
        <div className="h-7 w-48 bg-dusk/8 rounded mb-2" />
        <div className="h-4 w-64 bg-dusk/8 rounded mb-6" />
        <div className="h-12 w-full bg-dust rounded-xl mb-5" />
        <div className="h-12 w-full bg-dust rounded-xl mb-5" />
        <div className="h-12 w-full bg-dust rounded-full" />
      </div>
    );
  }

  if (linkExpired) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-dusk/8">
        <h2 className="font-display text-2xl font-bold text-dusk mb-1">
          Lien expiré
        </h2>
        <p className="text-dusk/60 text-sm mt-4 mb-6">{LIEN_EXPIRE}</p>
        <a
          href="/mot-de-passe-oublie"
          className="w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          Faire une nouvelle demande
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-dusk/8">
      <h2 className="font-display text-2xl font-bold text-dusk mb-1">
        Nouveau mot de passe
      </h2>
      <p className="text-dusk/50 text-sm mb-6">
        Choisissez un mot de passe d&apos;au moins 8 caractères.
      </p>

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-dusk/70 mb-1.5"
          >
            Nouveau mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label
            htmlFor="confirmation"
            className="block text-sm font-medium text-dusk/70 mb-1.5"
          >
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmation"
            name="confirmation"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isLoading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}
