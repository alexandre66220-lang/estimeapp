"use client";

import { useState } from "react";
import { Eye, Check, X } from "@phosphor-icons/react";
import {
  TEMPLATE_EMAIL_DEFAUT,
  VARIABLES_TEMPLATE_EMAIL,
  appliquerVariablesTemplate,
} from "@/lib/email-template";
import { updateTemplateEmail, reinitialiserTemplateEmail } from "@/app/actions/profile";

const APERCU_VALUES = {
  prenomClient: "Camille",
  prenomArtisan: "Julien",
  metier: "plombier",
  lienAvis: "https://g.page/r/votre-entreprise/review",
  titreChantier: "Rénovation salle de bain",
};

export function TemplateEmailForm({
  templateInitial,
}: {
  templateInitial: string | null;
}) {
  const [template, setTemplate] = useState(templateInitial ?? TEMPLATE_EMAIL_DEFAUT);
  const [apercuOuvert, setApercuOuvert] = useState(false);

  const apercu = appliquerVariablesTemplate(template, APERCU_VALUES);

  return (
    <div>
      <div className="rounded-xl bg-dust px-4 py-3.5 mb-5">
        <p className="text-xs font-semibold text-dusk/70 mb-1.5">
          Variables disponibles
        </p>
        <ul className="text-xs text-dusk/55 leading-relaxed space-y-0.5">
          {VARIABLES_TEMPLATE_EMAIL.map((item) => (
            <li key={item.variable}>
              <code className="text-braise font-semibold">{item.variable}</code> →{" "}
              {item.description}
            </li>
          ))}
        </ul>
      </div>

      <form action={updateTemplateEmail} className="space-y-5">
        <div>
          <label
            htmlFor="templateEmail"
            className="block text-sm font-medium text-dusk/70 mb-1.5"
          >
            Modèle de l&apos;email
          </label>
          <textarea
            id="templateEmail"
            name="templateEmail"
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
          >
            <Check size={16} weight="bold" aria-hidden="true" />
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => setApercuOuvert(true)}
            className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
          >
            <Eye size={16} weight="bold" aria-hidden="true" />
            Aperçu
          </button>
        </div>
      </form>

      <form action={reinitialiserTemplateEmail} className="mt-3">
        <button
          type="submit"
          onClick={() => setTemplate(TEMPLATE_EMAIL_DEFAUT)}
          className="text-xs font-semibold text-dusk/45 hover:text-dusk/70 hover:underline transition-colors duration-200"
        >
          Réinitialiser le template par défaut
        </button>
      </form>

      {apercuOuvert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dusk/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apercu-titre"
        >
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 id="apercu-titre" className="font-display text-lg font-bold text-dusk">
                Aperçu de l&apos;email
              </h2>
              <button
                type="button"
                onClick={() => setApercuOuvert(false)}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-dusk/40 hover:bg-dusk/5 transition-colors duration-200"
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-dusk/45 mb-3">
              Aperçu avec des données fictives.
            </p>
            <p className="text-dusk/80 text-sm leading-relaxed whitespace-pre-wrap bg-dust rounded-xl px-4 py-3.5">
              {apercu}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
