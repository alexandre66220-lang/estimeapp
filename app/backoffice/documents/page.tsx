import { Header } from "@/components/backoffice/Header";
import { TemplatesListPanel } from "@/components/backoffice/TemplatesListPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getTemplates } from "@/lib/backoffice/documents";

export default async function DocumentsPage() {
  const { supabase } = await getCurrentUser();
  const templates = await getTemplates(supabase);

  return (
    <>
      <Header title="Documents" subtitle="Templates réutilisables" />
      <div className="p-4 sm:p-8 max-w-2xl">
        <TemplatesListPanel templates={templates} />
      </div>
    </>
  );
}
