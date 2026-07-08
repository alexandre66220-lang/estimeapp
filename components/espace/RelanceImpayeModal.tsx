"use client";

import { useState, useTransition } from "react";
import { X, PaperPlaneTilt, Check, Warning } from "@phosphor-icons/react";
import { envoyerRelanceImpaye } from "@/app/actions/paiements";

interface Props {
  chantierId: string;
  clientId: string | null;
  clientEmail: string;
  clientPrenom: string;
  chantiertTitre: string;
  montantEnRetard: number;
  joursRetard: number;
  nbRelancesDejaEnvoyees: number;
  onClose: () => void;
  onSent: () => void;
}

const TEMPLATES = {
  premier: (prenom: string, titre: string, montant: number, jours: number) =>
    `Bonjour ${prenom},\n\nJe me permets de vous contacter concernant la facture du chantier "${titre}".\n\nSi vous avez des questions ou souhaitez convenir d'une modalité de règlement, n'hésitez pas à me recontacter.\n\nCordialement`,
  deuxieme: (prenom: string, titre: string, montant: number, jours: number) =>
    `Bonjour ${prenom},\n\nSauf erreur de ma part, le règlement de ${montant.toLocaleString("fr-FR")} € concernant le chantier "${titre}" est toujours en attente depuis ${jours} jour${jours > 1 ? "s" : ""}.\n\nPourriez-vous me confirmer la date prévue pour ce paiement ?\n\nCordialement`,
  troisieme: (prenom: string, titre: string, montant: number, jours: number) =>
    `Bonjour ${prenom},\n\nMalgré mes précédentes relances, le paiement de ${montant.toLocaleString("fr-FR")} € concernant le chantier "${titre}" n'a toujours pas été reçu.\n\nSans règlement sous 8 jours, je me verrai contraint d'engager une procédure de recouvrement.\n\nCordialement`,
};

const RELANCE_NIVEAUX: Array<"premier" | "deuxieme" | "troisieme"> = [
  "premier",
  "deuxieme",
  "troisieme",
];
const RELANCE_LABELS = {
  premier: "1ère relance (douce)",
  deuxieme: "2ème relance (ferme)",
  troisieme: "3ème relance (finale)",
};

export function RelanceImpayeModal({
  chantierId,
  clientId,
  clientEmail,
  clientPrenom,
  chantiertTitre,
  montantEnRetard,
  joursRetard,
  nbRelancesDejaEnvoyees,
  onClose,
  onSent,
}: Props) {
  const niveauSuggere = RELANCE_NIVEAUX[Math.min(nbRelancesDejaEnvoyees, 2)];
  const [niveau, setNiveau] = useState<"premier" | "deuxieme" | "troisieme">(niveauSuggere);
  const [corps, setCorps] = useState(
    TEMPLATES[niveauSuggere](clientPrenom, chantiertTitre, montantEnRetard, joursRetard)
  );
  const [sujet, setSujet] = useState(`Relance paiement — ${chantiertTitre}`);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [pending, startTransition] = useTransition();

  function handleNiveauChange(n: "premier" | "deuxieme" | "troisieme") {
    setNiveau(n);
    setCorps(TEMPLATES[n](clientPrenom, chantiertTitre, montantEnRetard, joursRetard));
  }

  function handleSend() {
    startTransition(async () => {
      const res = await envoyerRelanceImpaye({
        chantierId,
        clientId,
        type: niveau,
        email: clientEmail,
        sujet,
        corps,
      });
      if (res.ok) {
        setStatus("ok");
        setTimeout(onSent, 1200);
      } else {
        setStatus("error");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dusk/8">
          <h2 className="font-display text-lg font-bold text-dusk">Envoyer une relance</h2>
          <button onClick={onClose} className="text-dusk/40 hover:text-dusk transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Client info */}
          <div className="bg-dusk/4 rounded-xl px-4 py-3 text-sm text-dusk/70">
            <span className="font-medium text-dusk">{clientPrenom}</span> · {clientEmail}
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium text-dusk/70 mb-2">Niveau de relance</label>
            <div className="flex gap-2 flex-wrap">
              {RELANCE_NIVEAUX.map((n) => (
                <button
                  key={n}
                  onClick={() => handleNiveauChange(n)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    niveau === n
                      ? "bg-braise text-white border-braise"
                      : "border-dusk/20 text-dusk/60 hover:bg-dusk/5"
                  }`}
                >
                  {RELANCE_LABELS[n]}
                </button>
              ))}
            </div>
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-dusk/70 mb-1.5">Objet</label>
            <input
              type="text"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-ambre/30"
            />
          </div>

          {/* Corps */}
          <div>
            <label className="block text-sm font-medium text-dusk/70 mb-1.5">Message</label>
            <textarea
              value={corps}
              onChange={(e) => setCorps(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ambre/30"
            />
          </div>

          {status === "ok" && (
            <p className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl">
              <Check size={16} weight="bold" />
              Relance envoyée avec succès !
            </p>
          )}
          {status === "error" && (
            <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl">
              <Warning size={16} weight="bold" />
              Erreur lors de l&apos;envoi. Vérifiez votre configuration.
            </p>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-dusk/60 border border-dusk/20 rounded-full py-2.5 hover:bg-dusk/5 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={pending || status === "ok"}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-braise text-white text-sm font-semibold rounded-full py-2.5 hover:bg-ambre disabled:opacity-50 transition-colors"
          >
            <PaperPlaneTilt size={15} weight="bold" />
            {pending ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}
