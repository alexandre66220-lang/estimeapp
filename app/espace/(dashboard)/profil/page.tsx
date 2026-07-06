import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { getSignedChantierPhotoUrl } from "@/lib/supabase/storage";
import { ProfilForm, type ProfilData } from "@/components/espace/ProfilForm";
import { LogoUpload } from "@/components/espace/LogoUpload";

export const metadata: Metadata = {
  title: "Mon profil - Estime",
};

export default async function Profil({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Mon profil</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Ces informations permettent de personnaliser vos posts générés.
        </p>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<ProfilFormSkeleton />}>
          <ProfilFormSection message={message} error={error} />
        </Suspense>

        <Suspense fallback={<LogoSkeleton />}>
          <LogoSection />
        </Suspense>
      </div>
    </div>
  );
}

async function ProfilFormSection({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const { supabase, user } = await getCurrentUser();

  const profile = await getCachedProfile<ProfilData>(
    supabase,
    user!.id,
    "prenom, nom, metier, ville, ton_post, lien_avis_google"
  );

  return <ProfilForm profile={profile} message={message} error={error} />;
}

async function LogoSection() {
  const { supabase, user } = await getCurrentUser();

  const profile = await getCachedProfile<{ logo_url: string | null }>(
    supabase,
    user!.id,
    "logo_url"
  );

  const logoUrl = await getSignedChantierPhotoUrl(supabase, profile?.logo_url ?? null);

  return <LogoUpload currentLogoUrl={logoUrl} />;
}

function ProfilFormSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl animate-pulse">
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-24 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-full bg-dust rounded-xl mb-5" />
      <div className="h-12 w-32 bg-dust rounded-full" />
    </div>
  );
}

function LogoSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl animate-pulse">
      <div className="h-5 w-24 bg-dust rounded mb-2" />
      <div className="h-4 w-64 bg-dust rounded mb-5" />
      <div className="flex items-start gap-5">
        <div className="w-24 h-24 rounded-xl bg-dust shrink-0" />
        <div className="flex-1 h-12 bg-dust rounded-xl" />
      </div>
    </div>
  );
}
