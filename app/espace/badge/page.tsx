import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { CopierBadge } from "@/components/espace/CopierBadge";

export const metadata: Metadata = {
  title: "Mon badge - Estime",
};

const SITE_URL = "https://estime-app.com";

export default function Badge() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Mon badge Estime</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Affichez votre score de réputation sur votre site web.
        </p>
      </div>

      <Suspense fallback={<BadgeSkeleton />}>
        <BadgeSection />
      </Suspense>
    </div>
  );
}

async function BadgeSection() {
  const { user } = await getCurrentUser();
  const svgUrl = `${SITE_URL}/api/badge/${user!.id}/svg`;
  const embedCode = `<a href="${SITE_URL}"><img src="${svgUrl}" alt="Badge Estime" /></a>`;

  return (
    <>
      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-8">
        <h2 className="font-display text-sm font-bold text-dusk mb-4">Prévisualisation</h2>
        <div className="flex items-center justify-center bg-dust rounded-xl p-6">
          <Image
            src={svgUrl}
            alt="Aperçu de votre badge Estime"
            width={320}
            height={120}
            unoptimized
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-8">
        <h2 className="font-display text-sm font-bold text-dusk mb-4">
          Code à intégrer sur votre site
        </h2>
        <pre className="bg-dust rounded-xl p-4 text-xs text-dusk/70 overflow-x-auto whitespace-pre-wrap break-all mb-4">
          {embedCode}
        </pre>
        <CopierBadge value={embedCode} />
      </div>

      <a
        href={`/badge-demo?userId=${user!.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ambre hover:underline"
      >
        Voir une démo sur un vrai site
        <ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
      </a>
    </>
  );
}

function BadgeSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-48 bg-white border border-dusk/8 rounded-2xl" />
      <div className="h-40 bg-white border border-dusk/8 rounded-2xl" />
    </div>
  );
}
