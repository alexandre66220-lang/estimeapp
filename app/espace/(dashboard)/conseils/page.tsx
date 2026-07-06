import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { getConseilSemaine, getConseils } from "@/lib/sanity/queries";
import type { ArticleConseil, ConseilMetier } from "@/lib/sanity/queries";
import { ConseilsMetierFilter } from "@/components/espace/ConseilsMetierFilter";

export const metadata: Metadata = {
  title: "Conseils et astuces - Estime",
};

const METIERS: { value: ConseilMetier | "general"; label: string }[] = [
  { value: "general", label: "Tous" },
  { value: "peintre", label: "Peintre" },
  { value: "plombier", label: "Plombier" },
  { value: "electricien", label: "Électricien" },
  { value: "macon", label: "Maçon" },
  { value: "carreleur", label: "Carreleur" },
  { value: "couvreur", label: "Couvreur" },
  { value: "menuisier", label: "Menuisier" },
  { value: "plaquiste", label: "Plaquiste" },
  { value: "chauffagiste", label: "Chauffagiste" },
  { value: "facadier", label: "Façadier" },
];

const TAG_COLORS: Record<string, string> = {
  Technique: "bg-blue-50 text-blue-700",
  Marketing: "bg-purple-50 text-purple-700",
  Gestion: "bg-green-50 text-green-700",
  Réputation: "bg-yellow-50 text-yellow-700",
  Sécurité: "bg-red-50 text-red-700",
};

export default async function ConseilsPage({
  searchParams,
}: {
  searchParams: Promise<{ metier?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <Suspense fallback={<ConseilsSkeleton />}>
        <ConseilsContent metierParam={params.metier} />
      </Suspense>
    </div>
  );
}

async function ConseilsContent({ metierParam }: { metierParam?: string }) {
  const { supabase, user } = await getCurrentUser();
  const profile = await getCachedProfile<{ metier: string | null }>(supabase, user!.id, "metier");

  const rawMetier = profile?.metier ?? null;
  const profileMetier = (!rawMetier || rawMetier === "Autre")
    ? null
    : rawMetier.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const activeMetier = (metierParam ?? profileMetier ?? "general") as ConseilMetier | "general";
  const metierQuery = activeMetier === "general" ? null : activeMetier;

  const [conseilSemaine, conseils] = await Promise.all([
    getConseilSemaine(metierQuery),
    getConseils(metierQuery),
  ]);

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-dusk">Conseils et astuces</h1>
          <p className="text-dusk/50 text-sm mt-1">
            Des conseils pratiques rédigés par des experts du BTP.
          </p>
        </div>
        <Link
          href="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-dusk/50 hover:text-dusk transition-colors"
        >
          Voir tous les articles →
        </Link>
      </div>

      <ConseilsMetierFilter metiers={METIERS} active={activeMetier} />

      {conseilSemaine && (
        <section className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-ambre mb-3">Conseil de la semaine</p>
          <ConseilSemaineCard article={conseilSemaine} />
        </section>
      )}

      {conseils.length > 0 ? (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-dusk/40 mb-4">
            {activeMetier === "general"
              ? "Tous les articles"
              : `Articles pour ${METIERS.find(m => m.value === activeMetier)?.label ?? activeMetier}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {conseils.map((article) => (
              <ArticleCard key={article._id} article={article} tagColors={TAG_COLORS} />
            ))}
          </div>
        </section>
      ) : (
        !conseilSemaine && (
          <div className="text-center py-16 text-dusk/40">
            <p className="text-lg font-medium mb-1">Aucun article disponible</p>
            <p className="text-sm">Revenez bientôt, de nouveaux conseils arrivent régulièrement.</p>
          </div>
        )
      )}
    </>
  );
}

function ConseilSemaineCard({ article }: { article: ArticleConseil }) {
  const slug = article.slug.current;
  return (
    <Link
      href={`/espace/conseils/${slug}`}
      className="block bg-dusk rounded-2xl overflow-hidden hover:opacity-90 transition-opacity"
    >
      {article.image_principale?.url && (
        <div className="relative w-full h-48">
          <Image
            src={article.image_principale.url}
            alt={article.image_principale.alt ?? article.titre}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 800px"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-ambre bg-ambre/10 px-2 py-0.5 rounded-full">
            {article.categorie}
          </span>
          <span className="text-xs text-white/40">{article.temps_lecture} min de lecture</span>
        </div>
        <h2 className="font-display text-xl font-bold text-dust mb-2">{article.titre}</h2>
        {article.resume && <p className="text-dust/60 text-sm line-clamp-2">{article.resume}</p>}
        <p className="text-ambre text-sm font-medium mt-4">Lire l&apos;article →</p>
      </div>
    </Link>
  );
}

function ArticleCard({ article, tagColors }: { article: ArticleConseil; tagColors: Record<string, string> }) {
  const slug = article.slug.current;
  return (
    <Link
      href={`/espace/conseils/${slug}`}
      className="block bg-white border border-dusk/8 rounded-2xl p-5 hover:shadow-sm hover:border-dusk/15 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[article.categorie] ?? "bg-dust text-dusk"}`}>
          {article.categorie}
        </span>
        <span className="text-xs text-dusk/35">{article.temps_lecture} min</span>
      </div>
      <h3 className="font-semibold text-dusk text-sm leading-snug mb-2 group-hover:text-ambre transition-colors line-clamp-2">
        {article.titre}
      </h3>
      {article.resume && (
        <p className="text-dusk/50 text-xs leading-relaxed line-clamp-3">{article.resume}</p>
      )}
    </Link>
  );
}

function ConseilsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-dust rounded mb-2" />
        <div className="h-4 w-48 bg-dust rounded" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 w-20 bg-dust rounded-full shrink-0" />)}
      </div>
      <div className="h-48 bg-dusk/8 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 bg-white rounded-2xl border border-dusk/8" />)}
      </div>
    </div>
  );
}
