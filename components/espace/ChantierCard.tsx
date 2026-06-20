import Link from "next/link";
import Image from "next/image";
import { CaretRight, HardHat } from "@phosphor-icons/react/dist/ssr";

type Chantier = {
  id: string;
  titre: string;
  statut: string;
  photo_avant_url: string | null;
  photo_apres_url: string | null;
  created_at: string;
};

export default function ChantierCard({ chantier }: { chantier: Chantier }) {
  const thumbnail = chantier.photo_apres_url ?? chantier.photo_avant_url;
  const isTermine = chantier.statut === "termine";

  return (
    <Link
      href={`/espace/chantiers/${chantier.id}`}
      className="flex items-center gap-4 bg-white rounded-2xl border border-charbon/8 p-4 hover:border-terracotta/30 transition-colors duration-200"
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-creme-dark shrink-0">
        {thumbnail ? (
          <Image src={thumbnail} alt="" fill className="object-cover" sizes="56px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HardHat size={20} className="text-terracotta/40" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charbon truncate">{chantier.titre}</p>
        <p className="text-charbon/45 text-xs mt-0.5">
          {new Date(chantier.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <span
        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
          isTermine ? "bg-charbon/5 text-charbon/60" : "bg-terracotta/10 text-terracotta-dark"
        }`}
      >
        {isTermine ? "Terminé" : "En cours"}
      </span>
      <CaretRight size={16} className="text-charbon/30 shrink-0" aria-hidden="true" />
    </Link>
  );
}
