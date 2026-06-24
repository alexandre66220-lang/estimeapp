"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { completeOnboarding, skipOnboarding } from "@/app/actions/onboarding";
import { METIERS, TONS } from "@/lib/onboarding-constants";

interface OnboardingWizardProps {
  initialError?: string;
}

const TONE_EXAMPLES: Record<string, string> = {
  professionnel:
    "Chantier terminé à Castres. Peinture intérieure complète, résultat soigné et durable.",
  decontracte:
    "Encore un beau chantier bouclé ! 🎨 Super satisfaction pour cette peinture intérieure à Castres.",
  technique:
    "Application bicouche glycéro sur 85m², préparation enduit de lissage préalable. Résultat impeccable.",
};

export default function OnboardingWizard({ initialError }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [metier, setMetier] = useState("");
  const [ville, setVille] = useState("");
  const [lienAvisGoogle, setLienAvisGoogle] = useState("");
  const [noGoogleProfile, setNoGoogleProfile] = useState(false);
  const [tonPost, setTonPost] = useState("");

  const goNext = () => setStep((s) => Math.min(3, s + 1));

  return (
    <main className="bg-noir min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="font-landing-sans text-sm text-dust/50">
              Étape {step}/3
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-braise rounded-full"
              initial={false}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {initialError && (
          <p className="mb-6 text-sm text-red-400 font-landing-sans">{initialError}</p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-landing-display text-2xl font-semibold text-dust mb-8">
                Parlez-nous de vous
              </h1>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-dust placeholder:text-dust/40 font-landing-sans focus:outline-none focus:border-braise transition-colors"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-dust placeholder:text-dust/40 font-landing-sans focus:outline-none focus:border-braise transition-colors"
                />
                <select
                  value={metier}
                  onChange={(e) => setMetier(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-dust font-landing-sans focus:outline-none focus:border-braise transition-colors [&>option]:bg-noir"
                >
                  <option value="" disabled>
                    Métier
                  </option>
                  {(METIERS ?? []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-dust placeholder:text-dust/40 font-landing-sans focus:outline-none focus:border-braise transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={goNext}
                className="mt-8 w-full rounded-xl bg-braise text-dust font-landing-sans font-semibold py-3 hover:bg-braise/90 transition-colors"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-landing-display text-2xl font-semibold text-dust mb-2">
                Votre fiche Google
              </h1>
              <p className="font-landing-sans text-dust/60 text-sm mb-6">
                Où vos clients peuvent laisser un avis ?
              </p>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                <p className="font-landing-sans text-dust/60 text-sm leading-relaxed">
                  Allez sur Google, cherchez votre entreprise, cliquez sur
                  &laquo; Écrire un avis &raquo; et copiez le lien.
                </p>
              </div>

              <input
                type="url"
                placeholder="Lien de votre fiche Google Business Profile"
                value={lienAvisGoogle}
                onChange={(e) => setLienAvisGoogle(e.target.value)}
                disabled={noGoogleProfile}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-dust placeholder:text-dust/40 font-landing-sans focus:outline-none focus:border-braise transition-colors disabled:opacity-40"
              />

              <label className="mt-4 flex items-center gap-2 font-landing-sans text-sm text-dust/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noGoogleProfile}
                  onChange={(e) => {
                    setNoGoogleProfile(e.target.checked);
                    if (e.target.checked) setLienAvisGoogle("");
                  }}
                  className="accent-braise"
                />
                Je n&apos;ai pas encore de fiche Google
              </label>

              {noGoogleProfile && (
                <a
                  href="https://business.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-braise hover:underline font-landing-sans text-sm"
                >
                  Créer ma fiche Google My Business →
                </a>
              )}

              <button
                type="button"
                onClick={goNext}
                className="mt-8 w-full rounded-xl bg-braise text-dust font-landing-sans font-semibold py-3 hover:bg-braise/90 transition-colors"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="font-landing-display text-2xl font-semibold text-dust mb-2">
                Choisissez votre ton
              </h1>
              <p className="font-landing-sans text-dust/60 text-sm mb-6">
                Comment voulez-vous vous exprimer sur les réseaux ?
              </p>

              <form action={completeOnboarding}>
                <input type="hidden" name="prenom" value={prenom} />
                <input type="hidden" name="nom" value={nom} />
                <input type="hidden" name="metier" value={metier} />
                <input type="hidden" name="ville" value={ville} />
                <input type="hidden" name="lienAvisGoogle" value={lienAvisGoogle} />

                <div className="space-y-3">
                  {(TONS ?? []).map((ton) => (
                    <button
                      key={ton.value}
                      type="button"
                      onClick={() => setTonPost(ton.value)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                        tonPost === ton.value
                          ? "border-braise bg-braise/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <p className="font-landing-sans font-semibold text-dust text-sm mb-1">
                        {ton.label}
                      </p>
                      <p className="font-landing-sans text-dust/50 text-sm leading-relaxed">
                        {TONE_EXAMPLES[ton.value]}
                      </p>
                    </button>
                  ))}
                </div>

                <input type="hidden" name="tonPost" value={tonPost} />

                <button
                  type="submit"
                  disabled={!tonPost}
                  className="mt-8 w-full rounded-xl bg-braise text-dust font-landing-sans font-semibold py-3 hover:bg-braise/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Terminer et accéder à mon espace
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <form action={skipOnboarding} className="mt-6 text-center">
          <button
            type="submit"
            className="font-landing-sans text-sm text-dust/30 hover:text-dust/60 transition-colors"
          >
            Passer cette étape
          </button>
        </form>
      </div>
    </main>
  );
}
