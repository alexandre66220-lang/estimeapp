import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { Header } from "@/components/backoffice/Header";
import { TemplateDetailPanel } from "@/components/backoffice/TemplateDetailPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDocument } from "@/lib/backoffice/documents";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getCurrentUser();
  const template = await getDocument(supabase, id);

  if (!template || template.type !== "template") notFound();

  return (
    <>
      <Header title={template.titre} subtitle="Template" />
      <div className="p-4 sm:p-8 max-w-2xl space-y-4">
        <Link
          href="/backoffice/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B8B8D] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <ArrowLeft size={14} weight="bold" />
          Retour aux documents
        </Link>
        <TemplateDetailPanel template={template} />
      </div>
    </>
  );
}
