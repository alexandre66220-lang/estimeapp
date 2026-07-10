"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/actions/auth";

function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6"
      style={{
        background: "#2B2521",
        animation: "fadeInOverlay 200ms ease forwards",
      }}
    >
      <span
        className="font-display text-3xl font-bold tracking-tight"
        style={{ color: "#F8F5F2" }}
      >
        Estime
      </span>
      {/* Spinner terracotta */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        style={{ animation: "spinOverlay 0.8s linear infinite" }}
        aria-hidden="true"
      >
        <circle cx="18" cy="18" r="15" stroke="#C75D3B" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M18 3 A15 15 0 0 1 33 18"
          stroke="#C75D3B"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p style={{ color: "#9C9489", fontSize: "0.875rem" }}>Connexion en cours…</p>
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0 } to { opacity: 1 } }
        @keyframes spinOverlay   { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

export function ConnexionForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Réveille l'endpoint auth Supabase (cold start free plan → 10-20s)
    // pendant que l'utilisateur saisit ses identifiants.
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`).catch(() => {});

    // Précharge le bundle JS du tableau de bord pendant la saisie
    const timer = setTimeout(() => {
      router.prefetch("/espace/tableau-de-bord");
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Affiche le loader immédiatement, AVANT tout appel réseau
    setIsLoading(true);

    startTransition(async () => {
      try {
        await login(formData);
      } catch {
        // redirect() lève une exception interne que Next.js intercepte ;
        // tout autre catch indique une erreur inattendue, on retire le loader.
        setIsLoading(false);
      }
    });
  }

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="bg-white rounded-2xl p-8 border border-dusk/8">
      <h1 className="font-display text-2xl font-bold text-dusk mb-1">
        Connexion
      </h1>
      <p className="text-dusk/50 text-sm mb-6">
        Accédez à votre espace artisan.
      </p>

      {message && (
        <p className="mb-5 rounded-xl bg-ambre/10 text-braise text-sm px-4 py-3">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-5 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </p>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
            placeholder="••••••••"
          />
          <div className="text-right mt-1.5">
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs font-medium text-dusk/50 hover:text-braise transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
