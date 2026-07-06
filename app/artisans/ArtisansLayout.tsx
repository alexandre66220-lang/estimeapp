import Link from "next/link";
import { ArtisanCard } from "@/components/annuaire/ArtisanCard";
import { Star, ShieldCheck, Medal } from "@phosphor-icons/react/dist/ssr";
import type { ArtisanAnnuaire } from "@/app/actions/annuaire";

export function ArtisansNav() {
  return (
    <header className="border-b border-[#2B2521]/8 bg-[#F8F5F2]/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-landing-display text-lg font-semibold text-[#2B2521] hover:opacity-70 transition-opacity"
        >
          Estime
        </Link>
        <a
          href="/inscription"
          className="text-sm font-semibold text-white bg-[#C75D3B] px-4 py-2 rounded-full hover:bg-[#D4956B] transition-colors"
        >
          Commencer gratuitement
        </a>
      </div>
    </header>
  );
}

export function ArtisansGrid({ artisans }: { artisans: ArtisanAnnuaire[] }) {
  if (artisans.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {artisans.map((a) => (
        <ArtisanCard key={a.id} artisan={a} />
      ))}
    </div>
  );
}

export function WhyEstime({ metierLabel, villeLabel }: { metierLabel: string; villeLabel?: string }) {
  const lieu = villeLabel ? ` à ${villeLabel}` : "";
  return (
    <section className="bg-white rounded-2xl border border-[#2B2521]/8 p-8">
      <h2 className="font-landing-display text-xl font-semibold text-[#2B2521] mb-3">
        Pourquoi choisir un {metierLabel.toLowerCase()} certifié Estime{lieu} ?
      </h2>
      <p className="text-[#2B2521]/60 leading-relaxed mb-6 max-w-[65ch]">
        Les avis Google sont le premier critère de choix d&apos;un artisan. Les {metierLabel.toLowerCase()}s certifiés Estime{lieu} ont fait le choix de la transparence : leurs scores de réputation sont calculés à partir de leurs vrais avis clients, vérifiés et actualisés en temps réel.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <ShieldCheck size={20} weight="fill" className="text-[#C75D3B]" />, title: "Score de réputation vérifié", desc: "Calculé automatiquement à partir des avis Google authentiques." },
          { icon: <Star size={20} weight="fill" className="text-[#C75D3B]" />, title: "Avis Google authentiques", desc: "Chaque avis est lié à un vrai client et ne peut pas être falsifié." },
          { icon: <Medal size={20} weight="fill" className="text-[#C75D3B]" />, title: "Engagement qualité", desc: "Les artisans Estime s'engagent à répondre à leurs clients et à partager leurs réalisations." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex gap-3">
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div>
              <p className="text-sm font-semibold text-[#2B2521] mb-1">{title}</p>
              <p className="text-xs text-[#2B2521]/50 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function JoinCta({ metierLabel, villeLabel }: { metierLabel?: string; villeLabel?: string }) {
  const qui = metierLabel ? metierLabel.toLowerCase() : "artisan";
  const lieu = villeLabel ? ` à ${villeLabel}` : "";
  return (
    <section className="bg-[#2B2521] rounded-2xl p-8 text-center">
      <p className="font-landing-display text-xl font-semibold text-[#F8F5F2] mb-2">
        Vous êtes {qui}{lieu} ?
      </p>
      <p className="text-[#F8F5F2]/50 text-sm mb-5">
        Rejoignez Estime et soyez visible par vos prospects locaux grâce à vos avis Google et votre score de réputation.
      </p>
      <a
        href="/inscription"
        className="inline-flex items-center justify-center bg-[#C75D3B] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#D4956B] transition-colors"
      >
        Essayer gratuitement 14 jours
      </a>
      <p className="text-[#F8F5F2]/30 text-xs mt-3">Sans carte bancaire · Sans engagement</p>
    </section>
  );
}
