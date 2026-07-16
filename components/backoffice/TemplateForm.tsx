"use client";

import { useState, useTransition } from "react";
import { MarkdownPreview } from "./MarkdownPreview";

export function TemplateForm({
  action,
  initialValues,
  submitLabel,
  onDone,
}: {
  action: (formData: FormData) => Promise<void>;
  initialValues?: { titre: string; contenu: string };
  submitLabel: string;
  onDone?: () => void;
}) {
  const [contenu, setContenu] = useState(initialValues?.contenu ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await action(formData);
          onDone?.();
        });
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Titre</label>
        <input
          type="text"
          name="titre"
          required
          defaultValue={initialValues?.titre}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">
            Contenu (markdown : # titre, ## sous-titre, - liste, {"{{client_nom}}"})
          </label>
          <textarea
            name="contenu"
            rows={14}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] font-mono focus:outline-none focus:border-[#4ADE80]/50 resize-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#55555A] mb-1">Aperçu</label>
          <div className="bg-[#0C0C0D] border border-[#232326] rounded-md px-3 py-3 h-[268px] overflow-y-auto">
            <MarkdownPreview contenu={contenu} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md hover:bg-[#4ADE80]/20 transition-colors duration-150 disabled:opacity-50"
        >
          {isPending ? "…" : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-xs font-medium text-[#8B8B8D] px-3 py-1.5 rounded-md hover:bg-[#232326] transition-colors duration-150"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
