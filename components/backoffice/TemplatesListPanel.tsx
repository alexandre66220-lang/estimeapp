"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "@phosphor-icons/react";
import { creerTemplate } from "@/app/actions/backoffice-documents";
import { TemplateForm } from "./TemplateForm";
import type { AdminDocument } from "@/lib/backoffice/documents";

export function TemplatesListPanel({ templates }: { templates: AdminDocument[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#EDEDED]">Templates</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <Plus size={14} weight="bold" />
          Nouveau template
        </button>
      </div>

      {adding && (
        <div className="bg-[#18181B] border border-[#232326] rounded-[10px] p-5 mb-4">
          <TemplateForm action={creerTemplate} submitLabel="Créer le template" onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="bg-[#18181B] border border-[#232326] rounded-[10px] overflow-hidden">
        {templates.length === 0 ? (
          <p className="px-5 py-6 text-sm text-[#55555A]">Aucun template pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-[#232326]">
            {templates.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/backoffice/documents/${t.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#0C0C0D]/40 transition-colors duration-150"
                >
                  <FileText size={16} weight="bold" className="text-[#8B8B8D] shrink-0" />
                  <span className="text-sm text-[#EDEDED] truncate">{t.titre}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
