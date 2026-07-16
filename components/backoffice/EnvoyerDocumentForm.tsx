"use client";

import { useMemo, useState, useTransition } from "react";
import { envoyerDocumentDepuisTemplate } from "@/app/actions/backoffice-documents";
import { personnaliserContenu } from "@/lib/backoffice/document-type";
import { MarkdownPreview } from "./MarkdownPreview";
import type { AdminDocument } from "@/lib/backoffice/documents";

export function EnvoyerDocumentForm({
  clientId,
  clientNom,
  clientEntreprise,
  templates,
  onDone,
}: {
  clientId: string;
  clientNom: string;
  clientEntreprise: string | null;
  templates: AdminDocument[];
  onDone?: () => void;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const template = templates.find((t) => t.id === templateId);
  const apercu = useMemo(() => {
    if (!template) return "";
    return personnaliserContenu(template.contenu, { nom: clientNom, entreprise: clientEntreprise });
  }, [template, clientNom, clientEntreprise]);

  if (templates.length === 0) {
    return (
      <p className="text-sm text-[#55555A]">
        Aucun template disponible. Créez-en un dans{" "}
        <a href="/backoffice/documents" className="text-[#4ADE80] hover:underline">
          Documents
        </a>
        .
      </p>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await envoyerDocumentDepuisTemplate(clientId, formData);
          onDone?.();
        });
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Template</label>
        <select
          name="template_id"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.titre}
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="contenu" value={apercu} />

      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Titre du document</label>
        <input
          type="text"
          name="titre"
          defaultValue={template?.titre}
          key={templateId}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>

      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Aperçu (personnalisé pour {clientNom})</label>
        <div className="bg-[#0C0C0D] border border-[#232326] rounded-md px-3 py-3 max-h-56 overflow-y-auto">
          <MarkdownPreview contenu={apercu} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !template}
        className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
      >
        {isPending ? "Envoi…" : "Associer au client"}
      </button>
    </form>
  );
}
