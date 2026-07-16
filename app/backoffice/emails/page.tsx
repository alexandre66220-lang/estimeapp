import { Header } from "@/components/backoffice/Header";
import { EmailTemplatesListPanel } from "@/components/backoffice/EmailTemplatesListPanel";
import { getCurrentUser } from "@/lib/supabase/server";
import { getEmailTemplates } from "@/lib/backoffice/email-templates";

export default async function EmailsPage() {
  const { supabase } = await getCurrentUser();
  const templates = await getEmailTemplates(supabase);

  return (
    <>
      <Header title="Emails" subtitle="Templates réutilisables" />
      <div className="p-4 sm:p-8 max-w-2xl">
        <EmailTemplatesListPanel templates={templates} />
      </div>
    </>
  );
}
