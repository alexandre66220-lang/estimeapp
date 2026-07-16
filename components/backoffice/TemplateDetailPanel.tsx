"use client";

import { useState } from "react";
import Link from "next/link";
import { FilePdf } from "@phosphor-icons/react";
import { modifierTemplate } from "@/app/actions/backoffice-documents";
import { TemplateForm } from "./TemplateForm";
import { MarkdownPreview } from "./MarkdownPreview";
import { Card } from "./Card";
import type { AdminDocument } from "@/lib/backoffice/documents";

export function TemplateDetailPanel({ template }: { template: AdminDocument }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card title="Modifier le template">
        <div className="p-5">
          <TemplateForm
            action={(formData) => modifierTemplate(template.id, formData)}
            initialValues={{ titre: template.titre, contenu: template.contenu }}
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
        <div className="flex items-center gap-3">
          <Link
            href={`/api/backoffice/documents/${template.id}/pdf`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
          >
            <FilePdf size={14} weight="bold" />
            PDF
          </Link>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
          >
            Modifier
          </button>
        </div>
      }
    >
      <div className="p-5">
        <MarkdownPreview contenu={template.contenu} />
      </div>
    </Card>
  );
}
