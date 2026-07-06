import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Medal, InstagramLogo, FacebookLogo, TiktokLogo, ShieldCheck, Briefcase } from "@phosphor-icons/react/dist/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { niveauPourScore, NIVEAUX } from "@/lib/score/reputation";
import { ContactModal } from "@/components/artisan/ContactModal";
import { FadeIn } from "@/components/artisan/FadeIn";
import { PostGrid } from "@/components/artisan/PostGrid";

export const revalidate = 3600;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function signUrl(
  admin: ReturnType<typeof createAdminClient>,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const { data } = await admin.storage.from("chantiers").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

function initiales(prenom: string | null, nom: string | null, company: string | null): string {
  if (prenom && nom) return `${prenom[0]}${nom[0]}`.toUpperCase();
  if (company) return company.slice(0, 2).toUpperCase();
  return "??";
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("prenom, nom, metier, ville, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) return { title: "Artisan — Estime" };

  const name = [profile.prenom, profile.nom].filter(Boolean).join(" ") || "Artisan";
  const titleParts = [name, profile.metier && `${profile.metier}`, profile.ville && `à ${profile.ville}`]
    .filter(Boolean)
    .join(" — ");

  const logoUrl = await signUrl(admin, profile.logo_url);

  return {
    title: titleParts || `${name} — Estime`,
    description: `Découvrez les réalisations de ${name}${profile.metier ? `, ${profile.metier}` : ""}${profile.ville ? ` à ${profile.ville}` : ""}. Consultez ses avis Google et contactez-le directement.`,
    openGraph: {
      title: titleParts,
      description: `${name} utilise Estime pour partager ses chantiers et collecter des avis clients.`,
      ...(logoUrl ? { images: [{ url: logoUrl }] } : {}),
    },
    alternates: {
      canonical: `https://estime-app.com/artisan/${slug}`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VitrineArtisan({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  // Toutes les requêtes en parallèle
  const { data: profile } = await admin
    .from("profiles")
    .select("id, prenom, nom, metier, ville, logo_url, company_name, email, photo_profil, presentation, certifications, annees_experience, liens_sociaux, statut_disponibilite, numero_siret, theme_couleur")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) notFound();

  const userId = profile.id;

  const [
    { data: avis },
    { data: chantiers },
    { data: badgeData },
  ] = await Promise.all([
    admin
      .from("avis")
      .select("id, note_google, date_avis, chantier_id")
      .eq("user_id", userId)
      .order("date_avis", { ascending: false })
      .limit(5),
    admin
      .from("chantiers")
      .select("id, titre, photo_avant_url, photo_apres_url, avant_apres_url, created_at")
      .eq("user_id", userId)
      .not("photo_avant_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(12),
    admin.rpc("get_reputation_badge", { p_user_id: userId }),
  ]);

  // Posts : liés via chantier_id, pas user_id directement
  const chantierIds = (chantiers ?? []).map((c) => c.id);
  const { data: posts } =
    chantierIds.length > 0
      ? await admin
          .from("posts")
          .select("id, contenu, image_url, plateforme, created_at, chantier_id")
          .in("chantier_id", chantierIds)
          .order("created_at", { ascending: false })
          .limit(6)
      : { data: [] };

  // Signed URLs pour les photos
  const logoUrl = await signUrl(admin, profile.logo_url);
  const photoProfilUrl = profile.photo_profil
    ? await (async () => {
        const { data } = await admin.storage.from("profiles").createSignedUrl(profile.photo_profil!, 3600);
        return data?.signedUrl ?? null;
      })()
    : null;

  const chantiersWithUrls = await Promise.all(
    (chantiers ?? []).map(async (c) => {
      const [avant, apres, avantApres] = await Promise.all([
        signUrl(admin, c.photo_avant_url),
        signUrl(admin, c.photo_apres_url),
        signUrl(admin, c.avant_apres_url),
      ]);
      return { ...c, photo_avant_url: avant, photo_apres_url: apres, avant_apres_url: avantApres };
    })
  );

  const artisanNom =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.company_name || "Artisan";

  const scoreTotal: number = badgeData?.[0]?.score ?? 0;
  const niveau = niveauPourScore(scoreTotal);
  const niveauInfo = NIVEAUX[niveau];

  const avgNote =
    avis && avis.length > 0
      ? Math.round((avis.reduce((s, a) => s + a.note_google, 0) / avis.length) * 10) / 10
      : null;

  const allAvisCount: number = badgeData?.[0]?.totalAvis ?? (avis?.length ?? 0);

  const VALID_THEME_COLORS = ["#C75D3B", "#385144", "#2D4A6B", "#7B2D3E", "#C8922A", "#3D3D3D"];
  const themeColor = VALID_THEME_COLORS.includes(profile.theme_couleur ?? "") ? profile.theme_couleur! : "#C75D3B";
  const liens = (profile.liens_sociaux ?? {}) as { instagram?: string; facebook?: string; tiktok?: string };
  const certifs = (profile.certifications ?? []) as string[];
  const currentYear = new Date().getFullYear();
  const expYears = profile.annees_experience ? currentYear - profile.annees_experience : null;

  const statutInfo = profile.statut_disponibilite === "en_chantier"
    ? { label: "Chantier en cours", color: "#F59E0B" }
    : profile.statut_disponibilite === "complet"
    ? { label: "Complet", color: "#EF4444" }
    : { label: "Disponible", color: "#22C55E" };

  return (
    <>
      <style>{`
        @keyframes vitrineFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vitrine-fadein { opacity: 0; }
        .vitrine-fadein.vitrine-visible {
          animation: vitrineFadeUp 0.5s ease both;
        }
      `}</style>

      <div className="min-h-screen bg-[#F8F5F2]" style={{ color: "#2B2521" }}>

        {/* ── Header hero ── */}
        <header className="relative bg-white border-b border-[#2B2521]/6">
          <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14 flex flex-col items-center text-center gap-5">

            {/* Photo profil / Logo / initiales */}
            {photoProfilUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#2B2521]/8 shadow-sm">
                <Image
                  src={photoProfilUrl}
                  alt={`Photo de ${artisanNom}`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                  priority
                />
              </div>
            ) : logoUrl ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#F8F5F2] border border-[#2B2521]/8 flex items-center justify-center shadow-sm">
                <Image
                  src={logoUrl}
                  alt={`Logo ${artisanNom}`}
                  width={80}
                  height={80}
                  className="object-contain p-1"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColor }}>
                <span className="text-white text-2xl font-bold tracking-tight">
                  {initiales(profile.prenom, profile.nom, profile.company_name)}
                </span>
              </div>
            )}

            {/* Nom */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2521] leading-tight">
                {artisanNom}
              </h1>
              {(profile.metier || profile.ville) && (
                <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-[#2B2521]/55">
                  {profile.metier && <span>{profile.metier}</span>}
                  {profile.metier && profile.ville && <span>·</span>}
                  {profile.ville && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} aria-hidden="true" />
                      {profile.ville}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Statut + expérience */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: statutInfo.color }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                {statutInfo.label}
              </span>
              {expYears !== null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#2B2521]/6 text-[#2B2521]/70">
                  <Briefcase size={11} aria-hidden="true" />
                  {expYears} an{expYears > 1 ? "s" : ""} d&apos;expérience
                </span>
              )}
            </div>

            {/* Présentation */}
            {profile.presentation && (
              <p className="text-sm text-[#2B2521]/65 max-w-md leading-relaxed">{profile.presentation}</p>
            )}

            {/* Certifications */}
            {certifs.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {certifs.slice(0, 6).map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2B2521]/5 text-[#2B2521]/70 border border-[#2B2521]/8">
                    <ShieldCheck size={10} aria-hidden="true" />
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Badge Estime */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: `${themeColor}14`, borderColor: `${themeColor}25` }}>
              <Medal size={16} weight="fill" aria-hidden="true" style={{ color: themeColor }} />
              <span className="text-sm font-semibold" style={{ color: themeColor }}>
                {niveauInfo.label} Estime
              </span>
              <span className="text-xs" style={{ color: `${themeColor}99` }}>· {scoreTotal} pts</span>
            </div>

            {/* Réseaux sociaux */}
            {(liens.instagram || liens.facebook || liens.tiktok) && (
              <div className="flex items-center gap-3">
                {liens.instagram && (
                  <a href={liens.instagram} target="_blank" rel="noopener noreferrer" className="text-[#2B2521]/40 hover:text-[#E1306C] transition-colors">
                    <InstagramLogo size={20} weight="duotone" />
                  </a>
                )}
                {liens.facebook && (
                  <a href={liens.facebook} target="_blank" rel="noopener noreferrer" className="text-[#2B2521]/40 hover:text-[#1877F2] transition-colors">
                    <FacebookLogo size={20} weight="duotone" />
                  </a>
                )}
                {liens.tiktok && (
                  <a href={liens.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#2B2521]/40 hover:text-[#2B2521] transition-colors">
                    <TiktokLogo size={20} weight="duotone" />
                  </a>
                )}
              </div>
            )}

            {/* SIRET */}
            {profile.numero_siret && (
              <a
                href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${profile.numero_siret}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#2B2521]/40 hover:text-[#2B2521]/70"
              >
                <ShieldCheck size={12} />
                SIRET {profile.numero_siret}
              </a>
            )}

            {/* CTA contact */}
            <ContactModal slug={slug} artisanNom={artisanNom} />

            {/* Note globale */}
            {avgNote !== null && (
              <div className="flex items-center gap-2">
                <span className="inline-flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      size={16}
                      weight={v <= Math.round(avgNote) ? "fill" : "regular"}
                      className={v <= Math.round(avgNote) ? "text-amber-400" : "text-[#2B2521]/15"}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <span className="text-sm font-semibold text-[#2B2521]">{avgNote}/5</span>
                <span className="text-sm text-[#2B2521]/45">
                  ({allAvisCount} avis)
                </span>
              </div>
            )}

            {/* CTA contact */}
            <ContactModal slug={slug} artisanNom={artisanNom} />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-5 py-10 space-y-14">

          {/* ── Avis Google ── */}
          {avis && avis.length > 0 && (
            <FadeIn>
              <section aria-labelledby="section-avis">
                <SectionTitle id="section-avis" icon="⭐">Avis Google</SectionTitle>
                <div className="space-y-3 mt-5">
                  {avis.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white rounded-2xl border border-[#2B2521]/6 px-5 py-4"
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="inline-flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <Star
                              key={v}
                              size={14}
                              weight={v <= a.note_google ? "fill" : "regular"}
                              className={v <= a.note_google ? "text-amber-400" : "text-[#2B2521]/15"}
                              aria-hidden="true"
                            />
                          ))}
                        </span>
                        <time
                          dateTime={a.date_avis}
                          className="text-xs text-[#2B2521]/40"
                        >
                          {new Date(a.date_avis).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          {/* ── Chantiers réalisés ── */}
          {chantiersWithUrls.length > 0 && (
            <FadeIn delay={80}>
              <section aria-labelledby="section-chantiers">
                <SectionTitle id="section-chantiers" icon="🏗️">Réalisations</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                  {chantiersWithUrls.map((c) => {
                    const displayUrl = c.avant_apres_url ?? c.photo_apres_url ?? c.photo_avant_url;
                    if (!displayUrl) return null;
                    return (
                      <div key={c.id} className="group">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#E8E0D2]">
                          <Image
                            src={displayUrl}
                            alt={c.titre}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 33vw"
                            unoptimized
                          />
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-[#2B2521]/60 truncate px-0.5">
                          {c.titre}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </FadeIn>
          )}

          {/* ── Posts Instagram ── */}
          {posts && posts.length > 0 && (
            <FadeIn delay={160}>
              <section aria-labelledby="section-posts">
                <div className="flex items-center gap-2 mb-5">
                  <InstagramLogo size={20} className="text-[#C75D3B]" weight="duotone" aria-hidden="true" />
                  <h2
                    id="section-posts"
                    className="text-lg font-bold text-[#2B2521]"
                  >
                    Posts Instagram
                  </h2>
                </div>
                <PostGrid posts={posts} />
              </section>
            </FadeIn>
          )}

        </main>

        {/* ── Footer vitrine ── */}
        <footer className="border-t border-[#2B2521]/6 bg-white mt-16">
          <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#2B2521]/40">
              Propulsé par{" "}
              <Link
                href="https://estime-app.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#C75D3B] hover:underline"
              >
                Estime
              </Link>{" "}
              — L&apos;outil de réputation des artisans
            </p>
            <Link
              href="https://estime-app.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#2B2521]/40 hover:text-[#C75D3B] transition-colors"
            >
              Créer ma page vitrine →
            </Link>
          </div>
        </footer>

      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionTitle({
  id,
  icon,
  children,
}: {
  id: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="text-lg leading-none">
        {icon}
      </span>
      <h2 id={id} className="text-lg font-bold text-[#2B2521]">
        {children}
      </h2>
    </div>
  );
}
