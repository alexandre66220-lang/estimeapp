import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { getSignedChantierPhotoUrl } from "@/lib/supabase/storage";
import { ProfilForm, type ProfilData } from "@/components/espace/ProfilForm";
import { LogoUpload } from "@/components/espace/LogoUpload";
import { VitrineSection } from "@/components/artisan/VitrineSection";

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

        <Suspense fallback={<VitrineSkeleton />}>
          <VitrineSectionWrapper />
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

async function VitrineSectionWrapper() {
  const { supabase, user } = await getCurrentUser();

  const profile = await getCachedProfile<{ slug: string | null }>(
    supabase,
    user!.id,
    "slug"
  );

  if (!profile?.slug) {
    return (
      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
        <h2 className="font-display text-lg font-bold text-dusk mb-1">Ma page vitrine</h2>
        <p className="text-dusk/50 text-sm">
          Renseignez votre prénom et nom dans le formulaire ci-dessus pour générer votre
          page vitrine publique.
        </p>
      </div>
    );
  }

  return <VitrineSection slug={profile.slug} />;
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

function VitrineSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl animate-pulse">
      <div className="h-5 w-36 bg-dust rounded mb-2" />
      <div className="h-4 w-72 bg-dust rounded mb-5" />
      <div className="h-10 w-full bg-dust rounded-xl mb-5" />
      <div className="flex gap-3 mb-6">
        <div className="h-9 w-32 bg-dust rounded-full" />
        <div className="h-9 w-40 bg-dust rounded-full" />
      </div>
      <div className="h-28 w-28 bg-dust rounded-xl" />
    </div>
  );
}
