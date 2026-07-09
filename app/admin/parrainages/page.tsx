import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Gift, Clock } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getParrainagesEnAttente } from "@/lib/supabase/parrainage";
import { marquerConverti } from "@/app/actions/parrainage";

const ADMIN_EMAIL = "alcalspark@icloud.com";

export const metadata: Metadata = {
  title: "Admin, Parrainages",
};

export default async function AdminParrainages() {
  const { supabase, user } = await getCurrentUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/connexion");
  }

  const parrainages = await getParrainagesEnAttente(supabase);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">
          Parrainages en attente
        </h1>
        <p className="text-dusk/50 text-sm mt-1">
          Marquez un parrainage comme converti une fois l&apos;abonnement du
          filleul confirmé.
        </p>
      </div>

      {parrainages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dusk/8 py-16 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
            <Gift size={26} className="text-ambre" aria-hidden="true" />
          </div>
          <h3 className="font-display text-xl font-bold text-dusk mb-2">
            Aucun parrainage en attente
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dusk/8 divide-y divide-dusk/8">
          {parrainages.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-dusk truncate">
                  {entry.filleul_email ?? "Email inconnu"}
                </p>
                <p className="text-dusk/45 text-xs mt-0.5">
                  Parrain : {entry.parrain_email ?? "inconnu"} ·{" "}
                  {new Date(entry.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <form action={marquerConverti}>
                <input type="hidden" name="parrainageId" value={entry.id} />
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-braise text-white hover:bg-ambre transition-colors duration-200"
                >
                  <Clock size={14} weight="bold" aria-hidden="true" />
                  Marquer converti
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
