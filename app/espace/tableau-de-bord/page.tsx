import type { Metadata } from "next";
import Link from "next/link";
import {
  HardHat,
  Plus,
  Star,
  Megaphone,
  PaperPlaneTilt,
  Camera,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Tableau de bord - Estime",
};

const STATS = [
  { label: "Chantiers ce mois", value: 0, icon: HardHat },
  { label: "Avis reçus", value: 0, icon: Star },
  { label: "Posts générés", value: 0, icon: Megaphone },
  { label: "Recommandations envoyées", value: 0, icon: PaperPlaneTilt },
];

const ONBOARDING_STEPS = [
  { icon: Camera, label: "Photo du chantier" },
  { icon: Sparkle, label: "L'IA génère le post" },
  { icon: Star, label: "Relance pour l'avis" },
];

export default function TableauDeBord() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charbon">
            Tableau de bord
          </h1>
          <p className="text-charbon/50 text-sm mt-1">
            Vue d&apos;ensemble de votre activité.
          </p>
        </div>
        <Link
          href="/espace/nouveau-chantier"
          className="hidden sm:inline-flex items-center gap-2 bg-terracotta-dark text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-terracotta active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Nouveau chantier
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-charbon/8">
            <div className="inline-flex shrink-0 w-10 h-10 bg-terracotta/10 rounded-full items-center justify-center overflow-hidden mb-4">
              <Icon size={20} className="text-terracotta" aria-hidden="true" />
            </div>
            <p className="font-display text-3xl font-bold text-charbon">{value}</p>
            <p className="text-charbon/50 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden bg-charbon rounded-2xl p-8 lg:p-10 mb-10">
        <div
          className="absolute -top-10 -right-10 w-56 h-56 bg-terracotta/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-creme mb-2 relative">
          Bienvenue sur Estime
        </h2>
        <p className="text-creme/55 text-sm lg:text-base max-w-[52ch] mb-8 relative">
          Trois étapes séparent votre prochain chantier d&apos;un post Instagram
          prêt à publier et d&apos;un nouvel avis Google.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative">
          {ONBOARDING_STEPS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center shrink-0">
                <Icon size={20} weight="fill" className="text-terracotta" aria-hidden="true" />
              </div>
              <p className="text-creme/85 text-sm font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-charbon mb-4">Vos chantiers</h2>
      <div className="bg-white rounded-2xl border border-charbon/8 py-20 px-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-terracotta/10 rounded-full flex items-center justify-center mb-5">
          <HardHat size={26} className="text-terracotta" aria-hidden="true" />
        </div>
        <h3 className="font-display text-xl font-bold text-charbon mb-2">
          Aucun chantier pour l&apos;instant
        </h3>
        <p className="text-charbon/50 text-sm max-w-[40ch] mb-7">
          Ajoutez votre premier chantier pour générer vos photos avant/après et
          vos posts réseaux en quelques secondes.
        </p>
        <Link
          href="/espace/nouveau-chantier"
          className="inline-flex items-center gap-2 bg-terracotta-dark text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-terracotta active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Nouveau chantier
        </Link>
      </div>
    </div>
  );
}
