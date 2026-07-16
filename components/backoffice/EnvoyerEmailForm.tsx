"use client";

import { useMemo, useState, useTransition } from "react";
import { envoyerEmail } from "@/app/actions/backoffice-emails";
import { personnaliserContenu } from "@/lib/backoffice/document-type";
import type { AdminEmailTemplate } from "@/lib/backoffice/email-templates";

export function EnvoyerEmailForm({
  clientId,
  clientNom,
  clientEntreprise,
  templates,
  onDone,
}: {
  clientId: string;
  clientNom: string;
  clientEntreprise: string | null;
  templates: AdminEmailTemplate[];
  onDone?: () => void;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [sujet, setSujet] = useState("");
  const [corps, setCorps] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const template = templates.find((t) => t.id === templateId);

  const apercuSujet = useMemo(() => {
    if (!template) return sujet;
    return personnaliserContenu(template.sujet, { nom: clientNom, entreprise: clientEntreprise });
  }, [template, clientNom, clientEntreprise, sujet]);

  const apercuCorps = useMemo(() => {
    if (!template) return corps;
    return personnaliserContenu(template.corps, { nom: clientNom, entreprise: clientEntreprise });
  }, [template, clientNom, clientEntreprise, corps]);

  function handleSelectTemplate(id: string) {
    setTemplateId(id);
    setSujet("");
    setCorps("");
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await envoyerEmail(clientId, formData);
            onDone?.();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
          }
        });
      }}
      className="space-y-3"
    >
      {templates.length > 0 && (
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Template (optionnel)</label>
          <select
            value={templateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
          >
            <option value="">— Aucun —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titre}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Sujet</label>
        <input
          type="text"
          name="sujet"
          required
          value={sujet || apercuSujet}
          onChange={(e) => setSujet(e.target.value)}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>

      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Corps du message</label>
        <textarea
          name="corps"
          rows={10}
          value={corps || apercuCorps}
          onChange={(e) => setCorps(e.target.value)}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50 resize-none"
        />
      </div>

      {error && <p className="text-xs text-[#F87171]">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
      >
        {isPending ? "Envoi…" : "Envoyer l'email"}
      </button>
    </form>
  );
}
