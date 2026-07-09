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
import { AnimatedCounters } from "@/components/artisan/AnimatedCounters";
import { FaqAccordion } from "@/components/artisan/FaqAccordion";
import { buildBreadcrumbJsonLd } from "@/lib/seo/faq";
import {
  mergeVitrineConfig,
  googleFontsUrl,
  textureCSS,
  heroHeightCSS,
  waveTransitionSVG,
  separateurSVG,
} from "@/lib/vitrine/defaults";

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

function parseVideoEmbed(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const viMatch = url.match(/vimeo\.com\/(\d+)/);
  if (viMatch) return `https://player.vimeo.com/video/${viMatch[1]}`;
  return null;
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

  const { data: profile } = await admin
    .from("profiles")
    .select("id, prenom, nom, metier, ville, logo_url, company_name, email, photo_profil, presentation, certifications, annees_experience, liens_sociaux, statut_disponibilite, numero_siret, theme_couleur, slug, vitrine_config")
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

  // vitrine_config
  const vitrineConfig = mergeVitrineConfig(profile.vitrine_config ?? {});
  const vitrineCouleur = /^#[0-9A-Fa-f]{6}$/.test(vitrineConfig.hero.couleur_principale)
    ? vitrineConfig.hero.couleur_principale
    : themeColor;
  const vitrineSlogan = vitrineConfig.hero.slogan;
  const vitrineCtaTexte = vitrineConfig.hero.cta_texte || "Contactez-moi";
  const showChantiers = vitrineConfig.sections.chantiers.visible;
  const showAvis = vitrineConfig.sections.avis.visible;
  const showCertifications = vitrineConfig.sections.certifications.visible;
  const showContact = vitrineConfig.sections.contact.visible;
  const vitrineNombre = vitrineConfig.sections.chantiers.nombre;
  const vitrineAvisNombre = vitrineConfig.sections.avis.nombre;
  const vitrineZoneIntervention = vitrineConfig.sections.a_propos.zone_intervention;
  const vitrineSpecialites = vitrineConfig.sections.a_propos.specialites;
  const vitrineTarifs = vitrineConfig.sections.tarifs;
  const vitrineEquipe = vitrineConfig.sections.equipe;
  const vitrineTemplate = vitrineConfig.mise_en_page.template;

  // Typography
  const policeTitres = vitrineConfig.typographie.police_titres;
  const tailleTitres = vitrineConfig.typographie.taille_titres;
  const titleSizeMap = { normal: "text-lg", grand: "text-xl", tres_grand: "text-2xl" };
  const sectionTitleSize = titleSizeMap[tailleTitres];
  const fontFamily = `'${policeTitres}', ${policeTitres === "Playfair Display" || policeTitres === "Merriweather" ? "serif" : "sans-serif"}`;

  // Legacy police field
  const vitrinePolice =
    vitrineConfig.mise_en_page.police === "serif"
      ? "'Georgia', serif"
      : vitrineConfig.mise_en_page.police === "grotesque"
      ? "'Inter', 'Helvetica Neue', sans-serif"
      : "'Inter', sans-serif";
  const bodyFont = policeTitres !== "Inter" ? fontFamily : vitrinePolice;

  const cardRadius =
    vitrineConfig.mise_en_page.style_cards === "carre"
      ? "rounded-lg"
      : vitrineConfig.mise_en_page.style_cards === "ombre"
      ? "rounded-2xl shadow-md"
      : "rounded-2xl";

  // Hero
  const heroHeight = heroHeightCSS(vitrineConfig.hero.style);
  const heroOverlay = vitrineConfig.hero.overlay_couleur;
  const heroOpacity = vitrineConfig.hero.overlay_opacite;
  const overlayColorMap: Record<string, string> = {
    sombre: `rgba(0,0,0,${heroOpacity / 100})`,
    colore: `${vitrineCouleur}${Math.round(heroOpacity * 2.55).toString(16).padStart(2, "0")}`,
    degrade: `linear-gradient(to bottom, transparent, rgba(0,0,0,${heroOpacity / 100}))`,
    aucun: "transparent",
  };
  const overlayStyle = overlayColorMap[heroOverlay] ?? "transparent";

  // Background
  const fondTexture = textureCSS(vitrineConfig.fond.texture, vitrineCouleur);
  const decorLaterale = vitrineConfig.fond.decorations_laterales;

  // Hero wave SVG
  const heroWave = waveTransitionSVG(vitrineConfig.hero.forme_transition, "#F8F5F2");
  const heroWaveEncoded = heroWave ? `data:image/svg+xml,${encodeURIComponent(heroWave)}` : null;

  // Photo couverture hero
  const photoCouverture = vitrineConfig.hero.photo_couverture || null;

  // Chiffres clés
  const chiffres = vitrineConfig.sections.chiffres_cles;
  const showChiffres = chiffres.visible;
  const currentYear = new Date().getFullYear();
  const expYears = profile.annees_experience ? currentYear - profile.annees_experience : null;

  // Témoignage vedette
  const temoVedette = vitrineConfig.sections.temoignage_vedette;

  // Certification ruban
  const showRuban = vitrineConfig.sections.certifications_ruban.visible;

  // FAQ
  const faqSection = vitrineConfig.sections.faq;
  const showFaq = faqSection.visible && faqSection.items.length > 0;

  // Compteurs dans le hero
  const heroCompteursActifs = vitrineConfig.hero.compteurs_hero;
  const heroCompteursPosition = vitrineConfig.hero.compteurs_position;

  // Séparateurs entre sections
  const separateurStyle = vitrineConfig.separateurs;
  const separateurCSS = (() => {
    if (separateurStyle === "aucun") return "";
    if (separateurStyle === "ligne") {
      return `border-top: 1px solid ${vitrineCouleur}25;`;
    }
    if (separateurStyle === "icone") {
      return "";
    }
    const bg = separateurSVG(separateurStyle, vitrineCouleur);
    return bg ? `background-image: ${bg}; background-repeat: repeat-x; background-position: top center; background-size: 24px 16px;` : "";
  })();

  // Video
  const videoSection = vitrineConfig.sections.video;
  const videoEmbed = videoSection.visible ? parseVideoEmbed(videoSection.url) : null;

  // Limit slices
  const chantiersLimited = chantiersWithUrls.slice(0, vitrineNombre);
  const avisLimited = (avis ?? []).slice(0, vitrineAvisNombre);
  const liens = (profile.liens_sociaux ?? {}) as { instagram?: string; facebook?: string; tiktok?: string };
  const certifs = (profile.certifications ?? []) as string[];

  const vitrineCertifListe =
    vitrineConfig.sections.certifications.liste.length > 0
      ? vitrineConfig.sections.certifications.liste
      : certifs;

  const statutInfo = profile.statut_disponibilite === "en_chantier"
    ? { label: "Chantier en cours", color: "#F59E0B" }
    : profile.statut_disponibilite === "complet"
    ? { label: "Complet", color: "#EF4444" }
    : { label: "Disponible", color: "#22C55E" };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "https://estime-app.com" },
    { name: "Annuaire", url: "https://estime-app.com/annuaire" },
    { name: artisanNom, url: `https://estime-app.com/artisan/${profile.slug}` },
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: artisanNom,
    description: profile.presentation ?? `${profile.metier ?? "Artisan"} à ${profile.ville ?? "France"}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.ville ?? undefined,
      addressCountry: "FR",
    },
    url: `https://estime-app.com/artisan/${profile.slug}`,
    ...(avgNote && allAvisCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgNote,
            reviewCount: allAvisCount,
          },
        }
      : {}),
  };

  const faqJsonLd = showFaq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqSection.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.reponse },
        })),
      }
    : null;

  const hasHeroPhoto = !!photoCouverture;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {policeTitres !== "Inter" && (
        <link rel="stylesheet" href={googleFontsUrl(policeTitres)} />
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <style>{`
        @keyframes vitrineFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vitrine-fadein { opacity: 0; }
        .vitrine-fadein.vitrine-visible {
          animation: vitrineFadeUp 0.5s ease both;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 18s linear infinite;
          will-change: transform;
        }
        h1, h2, h3 {
          font-family: '${policeTitres}', ${policeTitres === "Playfair Display" || policeTitres === "Merriweather" ? "serif" : "sans-serif"};
        }
        .section-title {
          font-size: ${tailleTitres === "tres_grand" ? "1.25rem" : tailleTitres === "grand" ? "1.125rem" : "1rem"};
        }
        ${decorLaterale === "bordure" ? `
          .vitrine-page::before {
            content: '';
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: 4px;
            background: ${vitrineCouleur};
            z-index: 50;
          }
        ` : ""}
        ${decorLaterale === "bande" ? `
          .vitrine-page::before {
            content: '';
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: 48px;
            background: ${vitrineCouleur}12;
            z-index: 0;
          }
        ` : ""}
        ${decorLaterale === "watermark" ? `
          .vitrine-page::before, .vitrine-page::after {
            content: '🔨';
            position: fixed;
            top: 0; bottom: 0;
            width: 64px;
            font-size: 28px;
            line-height: 90px;
            text-align: center;
            white-space: pre-wrap;
            word-break: break-all;
            opacity: 0.05;
            z-index: 0;
            pointer-events: none;
          }
          .vitrine-page::before { left: 0; content: '🔨\\A📐\\A🧱\\A🪚\\A🔧\\A🏗️\\A🔨\\A📐\\A🧱\\A🪚'; }
          .vitrine-page::after { right: 0; content: '📐\\A🧱\\A🪚\\A🔧\\A🏗️\\A🔨\\A📐\\A🧱\\A🪚\\A🔧'; }
        ` : ""}
        ${separateurCSS ? `
          main.vitrine-main > .vitrine-fadein + .vitrine-fadein {
            position: relative;
            padding-top: 2rem;
          }
          main.vitrine-main > .vitrine-fadein + .vitrine-fadein::before {
            content: '${separateurStyle === "icone" ? "⚒" : ""}';
            display: block;
            position: absolute;
            top: 0.5rem; left: 50%;
            transform: translateX(-50%);
            width: ${separateurStyle === "icone" ? "auto" : "100%"};
            height: ${separateurStyle === "icone" ? "auto" : "16px"};
            font-size: 14px;
            color: ${vitrineCouleur}80;
            text-align: center;
            ${separateurCSS}
          }
        ` : ""}
        :root {
          --vitrine-couleur: ${vitrineCouleur};
          --vitrine-font: ${bodyFont};
        }
      `}</style>

      <div
        className="vitrine-page min-h-screen bg-[#F8F5F2] relative"
        style={{
          color: "#2B2521",
          fontFamily: bodyFont,
          ...(fondTexture ? { backgroundImage: fondTexture.replace("background-image: ", "").replace(";", "") } : {}),
        }}
      >

        {/* ── Hero ── */}
        <header
          className="relative overflow-hidden"
          style={{
            ...(hasHeroPhoto ? {
              backgroundImage: `url(${photoCouverture})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              ...(vitrineConfig.hero.parallaxe ? { backgroundAttachment: "fixed" } : {}),
            } : { backgroundColor: vitrineTemplate === "moderne" ? `${vitrineCouleur}10` : "white" }),
            [heroHeight.split(":")[0].trim()]: heroHeight.split(":")[1].trim(),
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Overlay */}
          {hasHeroPhoto && heroOverlay !== "aucun" && (
            <div
              className="absolute inset-0 z-0"
              style={{
                background: heroOverlay === "degrade"
                  ? `linear-gradient(to bottom, transparent, rgba(0,0,0,${heroOpacity / 100}))`
                  : overlayStyle,
              }}
            />
          )}

          {/* Hero content */}
          <div className={`relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-5 ${hasHeroPhoto ? "py-16 sm:py-24" : "py-10 sm:py-14"} gap-5 text-center`}>

            {/* Photo profil / Logo / initiales */}
            {photoProfilUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 shadow-sm"
                style={{ borderColor: hasHeroPhoto ? "rgba(255,255,255,0.3)" : `${vitrineCouleur}30` }}>
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
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/90 border border-white/20 flex items-center justify-center shadow-sm">
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
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: vitrineCouleur }}>
                <span className="text-white text-2xl font-bold tracking-tight">
                  {initiales(profile.prenom, profile.nom, profile.company_name)}
                </span>
              </div>
            )}

            {/* Nom */}
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold leading-tight ${hasHeroPhoto ? "text-white drop-shadow-sm" : "text-[#2B2521]"}`}>
                {artisanNom}
              </h1>
              {(profile.metier || profile.ville) && (
                <p className={`mt-1.5 flex items-center justify-center gap-1.5 text-sm ${hasHeroPhoto ? "text-white/80" : "text-[#2B2521]/55"}`}>
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
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${hasHeroPhoto ? "bg-white/15 text-white" : "bg-[#2B2521]/6 text-[#2B2521]/70"}`}>
                  <Briefcase size={11} aria-hidden="true" />
                  {expYears} an{expYears > 1 ? "s" : ""} d&apos;expérience
                </span>
              )}
            </div>

            {/* Slogan vitrine */}
            {vitrineSlogan && (
              <p className={`text-base font-semibold max-w-md ${hasHeroPhoto ? "text-white drop-shadow" : ""}`}
                style={hasHeroPhoto ? {} : { color: vitrineCouleur }}>
                &ldquo;{vitrineSlogan}&rdquo;
              </p>
            )}

            {/* Présentation */}
            {profile.presentation && (
              <p className={`text-sm max-w-md leading-relaxed ${hasHeroPhoto ? "text-white/80" : "text-[#2B2521]/65"}`}>
                {profile.presentation}
              </p>
            )}

            {/* Zone + spécialités */}
            {vitrineZoneIntervention && (
              <p className={`text-xs ${hasHeroPhoto ? "text-white/70" : "text-[#2B2521]/50"}`}>
                📍 Zone : {vitrineZoneIntervention}
              </p>
            )}
            {vitrineSpecialites.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {vitrineSpecialites.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={hasHeroPhoto
                      ? { backgroundColor: "rgba(255,255,255,0.2)", color: "white" }
                      : { backgroundColor: `${vitrineCouleur}15`, color: vitrineCouleur }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Certifications */}
            {showCertifications && vitrineCertifListe.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {vitrineCertifListe.slice(0, 6).map((c) => (
                  <span key={c}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${hasHeroPhoto ? "bg-white/15 text-white border-white/20" : "bg-[#2B2521]/5 text-[#2B2521]/70 border-[#2B2521]/8"}`}>
                    <ShieldCheck size={10} aria-hidden="true" />
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Badge Estime */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border"
              style={hasHeroPhoto
                ? { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)" }
                : { backgroundColor: `${vitrineCouleur}14`, borderColor: `${vitrineCouleur}25` }}>
              <Medal size={16} weight="fill" aria-hidden="true" style={{ color: hasHeroPhoto ? "white" : vitrineCouleur }} />
              <span className="text-sm font-semibold" style={{ color: hasHeroPhoto ? "white" : vitrineCouleur }}>
                {niveauInfo.label} Estime
              </span>
              <span className="text-xs" style={{ color: hasHeroPhoto ? "rgba(255,255,255,0.7)" : `${vitrineCouleur}99` }}>
                · {scoreTotal} pts
              </span>
            </div>

            {/* Réseaux sociaux */}
            {(liens.instagram || liens.facebook || liens.tiktok) && (
              <div className="flex items-center gap-3">
                {liens.instagram && (
                  <a href={liens.instagram} target="_blank" rel="noopener noreferrer"
                    className={`transition-colors ${hasHeroPhoto ? "text-white/60 hover:text-white" : "text-[#2B2521]/40 hover:text-[#E1306C]"}`}>
                    <InstagramLogo size={20} weight="duotone" />
                  </a>
                )}
                {liens.facebook && (
                  <a href={liens.facebook} target="_blank" rel="noopener noreferrer"
                    className={`transition-colors ${hasHeroPhoto ? "text-white/60 hover:text-white" : "text-[#2B2521]/40 hover:text-[#1877F2]"}`}>
                    <FacebookLogo size={20} weight="duotone" />
                  </a>
                )}
                {liens.tiktok && (
                  <a href={liens.tiktok} target="_blank" rel="noopener noreferrer"
                    className={`transition-colors ${hasHeroPhoto ? "text-white/60 hover:text-white" : "text-[#2B2521]/40 hover:text-[#2B2521]"}`}>
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
                className={`inline-flex items-center gap-1.5 text-xs ${hasHeroPhoto ? "text-white/50 hover:text-white/80" : "text-[#2B2521]/40 hover:text-[#2B2521]/70"}`}
              >
                <ShieldCheck size={12} />
                SIRET {profile.numero_siret}
              </a>
            )}

            {/* Note globale */}
            {avgNote !== null && (
              <div className="flex items-center gap-2">
                <span className="inline-flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      size={16}
                      weight={v <= Math.round(avgNote) ? "fill" : "regular"}
                      className={v <= Math.round(avgNote) ? "text-amber-400" : (hasHeroPhoto ? "text-white/20" : "text-[#2B2521]/15")}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <span className={`text-sm font-semibold ${hasHeroPhoto ? "text-white" : "text-[#2B2521]"}`}>{avgNote}/5</span>
                <span className={`text-sm ${hasHeroPhoto ? "text-white/60" : "text-[#2B2521]/45"}`}>
                  ({allAvisCount} avis)
                </span>
              </div>
            )}

            {/* CTA contact */}
            {showContact && (
              <ContactModal slug={slug} artisanNom={artisanNom} ctaLabel={vitrineCtaTexte} />
            )}

            {/* Compteurs dans le hero (position "bas") */}
            {heroCompteursActifs && heroCompteursPosition === "bas" && (
              <HeroCompteurs
                nbChantiers={chantiersWithUrls.length}
                nbAvis={allAvisCount}
                expYears={expYears}
                satisfaction={chiffres.satisfaction}
                clair={hasHeroPhoto}
              />
            )}
          </div>

          {/* Compteurs dans le hero (position "overlay", sur la photo) */}
          {heroCompteursActifs && heroCompteursPosition === "overlay" && hasHeroPhoto && (
            <div className="relative z-10 w-full pb-4">
              <HeroCompteurs
                nbChantiers={chantiersWithUrls.length}
                nbAvis={allAvisCount}
                expYears={expYears}
                satisfaction={chiffres.satisfaction}
                clair
              />
            </div>
          )}

          {/* Hero → page wave transition */}
          {heroWaveEncoded && (
            <div className="relative z-10 w-full" style={{ height: 60, marginTop: "auto" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroWaveEncoded}
                alt=""
                aria-hidden="true"
                className="absolute bottom-0 left-0 w-full"
                style={{ height: 60 }}
              />
            </div>
          )}
        </header>

        {/* ── Ruban certifications ── */}
        {showRuban && vitrineCertifListe.length > 0 && (
          <div className="overflow-hidden border-y border-[#2B2521]/6 bg-white py-3">
            <div className="flex whitespace-nowrap">
              <div className="marquee-track flex items-center gap-6 pr-6">
                {[...vitrineCertifListe, ...vitrineCertifListe].map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${vitrineCouleur}12`, color: vitrineCouleur }}>
                    <ShieldCheck size={11} weight="fill" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Chiffres clés ── */}
        {showChiffres && (
          <AnimatedCounters
            nbChantiers={chantiersWithUrls.length}
            nbAvis={allAvisCount}
            expYears={expYears}
            satisfaction={chiffres.satisfaction}
            couleur={vitrineCouleur}
            styleVariant={chiffres.style}
          />
        )}

        {/* ── Témoignage vedette ── */}
        {temoVedette.visible && temoVedette.texte_custom && (
          <FadeIn>
            <div className="max-w-2xl mx-auto px-5 py-8">
              <div
                className="rounded-3xl px-8 py-8 text-center relative overflow-hidden"
                style={{ backgroundColor: `${vitrineCouleur}10`, border: `1px solid ${vitrineCouleur}25` }}
              >
                <div className="text-5xl font-serif text-center mb-4 leading-none" style={{ color: `${vitrineCouleur}40` }}>
                  &ldquo;
                </div>
                <div className="flex justify-center mb-4">
                  {Array.from({ length: temoVedette.note }).map((_, i) => (
                    <Star key={i} size={18} weight="fill" className="text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-base text-[#2B2521] font-medium leading-relaxed italic max-w-lg mx-auto">
                  {temoVedette.texte_custom}
                </p>
                {temoVedette.auteur_custom && (
                  <p className="mt-4 text-sm font-semibold" style={{ color: vitrineCouleur }}>
                    — {temoVedette.auteur_custom}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        <main className="vitrine-main max-w-2xl mx-auto px-5 py-10 space-y-14">

          {/* ── Avis Google ── */}
          {showAvis && avisLimited.length > 0 && (
            <FadeIn>
              <section aria-labelledby="section-avis">
                <SectionTitle id="section-avis" icon="⭐" sizeClass={sectionTitleSize}>Avis Google</SectionTitle>
                <div className="space-y-3 mt-5">
                  {avisLimited.map((a) => (
                    <div
                      key={a.id}
                      className={`bg-white ${cardRadius} border border-[#2B2521]/6 px-5 py-4`}
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
          {showChantiers && chantiersLimited.length > 0 && (
            <FadeIn delay={80}>
              <section aria-labelledby="section-chantiers">
                <SectionTitle id="section-chantiers" icon="🏗️" sizeClass={sectionTitleSize}>Réalisations</SectionTitle>
                <div className={`mt-5 ${vitrineConfig.sections.chantiers.disposition === "liste" ? "space-y-3" : "grid grid-cols-2 sm:grid-cols-3 gap-3"}`}>
                  {chantiersLimited.map((c) => {
                    const displayUrl = c.avant_apres_url ?? c.photo_apres_url ?? c.photo_avant_url;
                    if (!displayUrl) return null;
                    return (
                      <div key={c.id} className="group">
                        <div className={`relative aspect-square ${cardRadius} overflow-hidden bg-[#E8E0D2]`}>
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

          {/* ── Tarifs ── */}
          {vitrineTarifs.visible && vitrineTarifs.lignes.length > 0 && (
            <FadeIn>
              <section aria-labelledby="section-tarifs">
                <SectionTitle id="section-tarifs" icon="💶" sizeClass={sectionTitleSize}>Tarifs</SectionTitle>
                <div className="space-y-3 mt-5">
                  {vitrineTarifs.lignes.map((l, i) => (
                    <div key={i} className={`bg-white ${cardRadius} border border-[#2B2521]/6 px-5 py-4 flex justify-between items-center gap-4`}>
                      <span className="text-sm text-[#2B2521]/70">{l.description}</span>
                      <span className="text-sm font-semibold shrink-0" style={{ color: vitrineCouleur }}>{l.prix}</span>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          {/* ── Équipe ── */}
          {vitrineEquipe.visible && vitrineEquipe.membres.length > 0 && (
            <FadeIn>
              <section aria-labelledby="section-equipe">
                <SectionTitle id="section-equipe" icon="👥" sizeClass={sectionTitleSize}>L&apos;équipe</SectionTitle>
                <div className="flex flex-wrap gap-4 mt-5">
                  {vitrineEquipe.membres.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: vitrineCouleur }}
                      >
                        {m.prenom?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <p className="text-sm font-medium text-[#2B2521]">{m.prenom}</p>
                      <p className="text-xs text-[#2B2521]/50">{m.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          {/* ── FAQ ── */}
          {showFaq && (
            <FadeIn>
              <section aria-labelledby="section-faq">
                <SectionTitle id="section-faq" icon="💬" sizeClass={sectionTitleSize}>Questions fréquentes</SectionTitle>
                <div className="mt-5">
                  <FaqAccordion items={faqSection.items} couleur={vitrineCouleur} />
                </div>
              </section>
            </FadeIn>
          )}

          {/* ── Vidéo ── */}
          {videoEmbed && (
            <FadeIn>
              <section aria-labelledby="section-video">
                <SectionTitle id="section-video" icon="🎬" sizeClass={sectionTitleSize}>Vidéo de présentation</SectionTitle>
                <div className="mt-5 rounded-2xl overflow-hidden aspect-video bg-black">
                  <iframe
                    src={videoEmbed}
                    title="Vidéo de présentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
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
                    className={`font-bold text-[#2B2521] ${sectionTitleSize}`}
                  >
                    Posts Instagram
                  </h2>
                </div>
                <PostGrid posts={posts} />
              </section>
            </FadeIn>
          )}

        </main>

        {/* ── Lien SEO local ── */}
        {(profile.metier || profile.ville) && (
          <div className="max-w-2xl mx-auto px-5 py-4 text-center">
            {profile.metier && profile.ville && (() => {
              const metierSlug = profile.metier!.toLowerCase()
                .normalize("NFD").replace(/[̀-ͯ]/g, "")
                .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              const villeSlug = profile.ville!.toLowerCase()
                .normalize("NFD").replace(/[̀-ͯ]/g, "")
                .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              return (
                <Link
                  href={`/artisans/${metierSlug}/${villeSlug}`}
                  className="text-xs text-[#2B2521]/40 hover:text-[#C75D3B] transition-colors"
                >
                  Voir tous les {profile.metier!.toLowerCase()}s à {profile.ville} →
                </Link>
              );
            })()}
          </div>
        )}

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

function HeroCompteurs({
  nbChantiers,
  nbAvis,
  expYears,
  satisfaction,
  clair,
}: {
  nbChantiers: number;
  nbAvis: number;
  expYears: number | null;
  satisfaction: number;
  clair: boolean;
}) {
  const items = [
    { icon: "🏗️", value: nbChantiers, label: "chantiers" },
    { icon: "⭐", value: nbAvis, label: "avis" },
    ...(expYears !== null ? [{ icon: "📅", value: expYears, label: "ans" }] : []),
    { icon: "✅", value: satisfaction, label: "% satisfaits" },
  ];

  return (
    <div className="flex items-center justify-center gap-5">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center">
          <span className={`text-sm font-bold ${clair ? "text-white" : "text-[#2B2521]"}`}>
            {it.icon} {it.value}
          </span>
          <span className={`text-[10px] ${clair ? "text-white/70" : "text-[#2B2521]/50"}`}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({
  id,
  icon,
  children,
  sizeClass,
}: {
  id: string;
  icon: string;
  children: React.ReactNode;
  sizeClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="text-lg leading-none">
        {icon}
      </span>
      <h2 id={id} className={`font-bold text-[#2B2521] section-title ${sizeClass}`}>
        {children}
      </h2>
    </div>
  );
}
