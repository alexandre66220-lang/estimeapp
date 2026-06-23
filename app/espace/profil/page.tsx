import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { ProfilForm, type ProfilData } from "@/components/espace/ProfilForm";

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

      <Suspense fallback={<ProfilFormSkeleton />}>
        <ProfilFormSection message={message} error={error} />
      </Suspense>
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getCachedProfile<ProfilData>(
    supabase,
    user!.id,
    "prenom, nom, metier, ville, ton_post, lien_avis_google"
  );

  return <ProfilForm profile={profile} message={message} error={error} />;
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
