"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MotDePasseOublieForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();

    if (!email) {
      setError("Veuillez renseigner votre email.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });
      // Message neutre dans tous les cas : on ne confirme jamais si
      // l'email existe ou non, y compris quand Supabase renvoie une
      // erreur (ex. limite de requêtes atteinte).
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessayez dans quelques instants.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-dusk/8">
        <h2 className="font-display text-2xl font-bold text-dusk mb-1">
          Vérifiez votre boîte mail
        </h2>
        <p className="text-dusk/60 text-sm mt-4">
          Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-dusk/8">
      <h2 className="font-display text-2xl font-bold text-dusk mb-1">
        Mot de passe oublié
      </h2>
      <p className="text-dusk/50 text-sm mb-6">
        Indiquez votre email, nous vous enverrons un lien pour le réinitialiser.
      </p>

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isLoading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
        </button>
      </form>
    </div>
  );
}
