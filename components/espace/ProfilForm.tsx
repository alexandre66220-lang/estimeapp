import { Check, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { updateProfil } from "@/app/actions/profile";

const METIERS = [
  "Peintre",
  "Plombier",
  "Électricien",
  "Maçon",
  "Carreleur",
  "Menuisier",
  "Autre",
];

const TONS = [
  { value: "professionnel", label: "Professionnel" },
  { value: "decontracte", label: "Décontracté" },
  { value: "technique", label: "Technique" },
];

export type ProfilData = {
  prenom: string | null;
  nom: string | null;
  metier: string | null;
  ville: string | null;
  ton_post: string | null;
  lien_avis_google: string | null;
};

export function ProfilForm({
  profile,
  message,
  error,
}: {
  profile: ProfilData | null;
  message?: string;
  error?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
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

      <form action={updateProfil} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-dusk/70 mb-1.5">
              Prénom
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              required
              defaultValue={profile?.prenom ?? ""}
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              placeholder="Jean"
            />
          </div>
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-dusk/70 mb-1.5">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              required
              defaultValue={profile?.nom ?? ""}
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
              placeholder="Dupont"
            />
          </div>
        </div>

        <div>
          <label htmlFor="metier" className="block text-sm font-medium text-dusk/70 mb-1.5">
            Métier
          </label>
          <select
            id="metier"
            name="metier"
            required
            defaultValue={profile?.metier ?? ""}
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
          >
            <option value="" disabled>
              Sélectionnez votre métier
            </option>
            {METIERS.map((metier) => (
              <option key={metier} value={metier}>
                {metier}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ville" className="block text-sm font-medium text-dusk/70 mb-1.5">
            Ville
          </label>
          <input
            type="text"
            id="ville"
            name="ville"
            required
            defaultValue={profile?.ville ?? ""}
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
            placeholder="Lyon"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-dusk/70 mb-2">
            Ton du post
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TONS.map((ton) => (
              <label
                key={ton.value}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm cursor-pointer has-[:checked]:border-ambre/50 has-[:checked]:bg-ambre/10 transition-all duration-200"
              >
                <input
                  type="radio"
                  name="tonPost"
                  value={ton.value}
                  required
                  defaultChecked={profile?.ton_post === ton.value}
                  className="accent-braise"
                />
                {ton.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="lienAvisGoogle" className="block text-sm font-medium text-dusk/70 mb-1.5">
            Lien Google Business
          </label>
          <input
            type="url"
            id="lienAvisGoogle"
            name="lienAvisGoogle"
            defaultValue={profile?.lien_avis_google ?? ""}
            placeholder="https://g.page/..."
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}
