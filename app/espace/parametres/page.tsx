import type { Metadata } from "next";
import { GearSix, Star, Check, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { updateLienAvisGoogle } from "@/app/actions/profile";

export const metadata: Metadata = {
  title: "Paramètres - Estime",
};

export default async function Parametres({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getCachedProfile<{ lien_avis_google: string | null }>(
    supabase,
    user!.id,
    "lien_avis_google"
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Paramètres</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Vos informations d&apos;entreprise et vos préférences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
        <div className="w-11 h-11 bg-ambre/10 rounded-xl flex items-center justify-center mb-5">
          <Star size={22} className="text-ambre" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-bold text-dusk mb-2">
          Votre fiche Google
        </h2>
        <p className="text-dusk/50 text-sm mb-6 max-w-[60ch]">
          Ce lien est utilisé pour inviter vos clients à laisser un avis après
          chaque chantier terminé.
        </p>

        {message && (
          <p className="mb-5 flex items-center gap-2 rounded-xl bg-ambre/10 text-braise text-sm px-4 py-3">
            <Check size={16} weight="bold" className="shrink-0" aria-hidden="true" />
            {message}
          </p>
        )}
        {error && (
          <p className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">
            <WarningCircle size={16} weight="bold" className="shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <form action={updateLienAvisGoogle} className="space-y-5">
          <div>
            <label
              htmlFor="lienAvisGoogle"
              className="block text-sm font-medium text-dusk/70 mb-1.5"
            >
              Lien vers votre fiche Google
            </label>
            <input
              type="url"
              id="lienAvisGoogle"
              name="lienAvisGoogle"
              defaultValue={profile?.lien_avis_google ?? ""}
              placeholder="https://g.page/r/votre-entreprise/review"
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
            />
          </div>

          <div className="rounded-xl bg-dust px-4 py-3.5">
            <p className="text-xs font-semibold text-dusk/70 mb-1.5">
              Comment trouver ce lien ?
            </p>
            <ol className="text-xs text-dusk/55 leading-relaxed list-decimal list-inside space-y-0.5">
              <li>Recherchez le nom de votre entreprise sur Google.</li>
              <li>
                Sur votre fiche d&apos;établissement, cliquez sur « Demander
                des avis » (ou « Partager »).
              </li>
              <li>Copiez le lien proposé et collez-le ci-dessus.</li>
            </ol>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
          >
            Enregistrer
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl mt-6 flex items-center gap-4 text-dusk/40">
        <div className="w-11 h-11 bg-dusk/5 rounded-xl flex items-center justify-center shrink-0">
          <GearSix size={20} aria-hidden="true" />
        </div>
        <p className="text-sm">
          La gestion de votre profil et de vos notifications arrive
          prochainement.
        </p>
      </div>
    </div>
  );
}
