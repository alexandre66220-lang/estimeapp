"use client";

import { useState } from "react";
import { modifierEmailTemplate } from "@/app/actions/backoffice-email-templates";
import { EmailTemplateForm } from "./EmailTemplateForm";
import { Card } from "./Card";
import type { AdminEmailTemplate } from "@/lib/backoffice/email-templates";

export function EmailTemplateDetailPanel({ template }: { template: AdminEmailTemplate }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card title="Modifier le template">
        <div className="p-5">
          <EmailTemplateForm
            action={(formData) => modifierEmailTemplate(template.id, formData)}
            initialValues={template}
            submitLabel="Enregistrer"
            onDone={() => setEditing(false)}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={template.titre}
      action={
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
        >
          Modifier
        </button>
      }
    >
      <div className="p-5 space-y-3">
        <div>
          <p className="text-[11px] text-[#55555A] uppercase tracking-wide mb-1">Sujet</p>
          <p className="text-sm text-[#EDEDED]">{template.sujet}</p>
        </div>
        <div>
          <p className="text-[11px] text-[#55555A] uppercase tracking-wide mb-1">Corps</p>
          <p className="text-sm text-[#8B8B8D] whitespace-pre-wrap">{template.corps}</p>
        </div>
      </div>
    </Card>
  );
}
