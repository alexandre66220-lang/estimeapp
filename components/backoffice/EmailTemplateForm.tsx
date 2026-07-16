"use client";

import { useTransition } from "react";

export function EmailTemplateForm({
  action,
  initialValues,
  submitLabel,
  onDone,
}: {
  action: (formData: FormData) => Promise<void>;
  initialValues?: { titre: string; sujet: string; corps: string };
  submitLabel: string;
  onDone?: () => void;
}) {
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
        <label className="block text-[11px] text-[#55555A] mb-1">Titre (interne)</label>
        <input
          type="text"
          name="titre"
          required
          defaultValue={initialValues?.titre}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">Sujet</label>
        <input
          type="text"
          name="sujet"
          required
          defaultValue={initialValues?.sujet}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50"
        />
      </div>
      <div>
        <label className="block text-[11px] text-[#55555A] mb-1">
          Corps ({"{{client_nom}}"} sera remplacé automatiquement)
        </label>
        <textarea
          name="corps"
          rows={10}
          defaultValue={initialValues?.corps}
          className="w-full bg-[#0C0C0D] border border-[#232326] rounded-md px-2.5 py-1.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#4ADE80]/50 resize-none"
        />
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
