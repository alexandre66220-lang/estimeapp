import Link from "next/link";
import ManageCookiesLink from "./ManageCookiesLink";

export default function Footer() {
  return (
    <footer className="bg-noir py-10 border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="font-landing-display text-lg font-semibold text-dust mb-3">Estime</p>
            <p className="text-dust/35 text-xs leading-relaxed max-w-[200px]">
              L&apos;app de réputation pour les artisans BTP.
            </p>
          </div>

          <div>
            <p className="text-dust/50 text-xs font-semibold uppercase tracking-wider mb-3">Ressources</p>
            <ul className="space-y-2" role="list">
              <li><Link href="/blog" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Blog</Link></li>
              <li><Link href="/artisans" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Artisans par métier</Link></li>
              <li><Link href="/annuaire" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Annuaire artisans</Link></li>
              <li><Link href="/fonctionnalites" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Fonctionnalités</Link></li>
              <li><Link href="/artisans/peintre" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Peintres BTP</Link></li>
              <li><Link href="/artisans/plombier" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Plombiers</Link></li>
              <li><Link href="/artisans/electricien" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Électriciens</Link></li>
              <li><Link href="/artisans/macon" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Maçons</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-dust/50 text-xs font-semibold uppercase tracking-wider mb-3">Légal</p>
            <ul className="space-y-2" role="list">
              <li><Link href="/mentions-legales" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Mentions légales</Link></li>
              <li><Link href="/cgu" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">CGU</Link></li>
              <li><Link href="/cgv" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">CGV</Link></li>
              <li><Link href="/politique-confidentialite" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Politique de confidentialité</Link></li>
              <li><Link href="/contact" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">Contact</Link></li>
              <li><ManageCookiesLink className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200 text-left" /></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-dust/25 text-xs">
            © 2026 Estime —{" "}
            <a
              href="https://alcalspark.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-dust/45 transition-colors duration-200"
            >
              Créé par AlcalSpark
            </a>
          </p>
          <a
            href="https://www.producthunt.com/products/estime?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-estime"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Estime - Reputation on autopilot for tradespeople | Product Hunt"
              width={250}
              height={54}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1189422&theme=light&t=1783348237784"
              style={{ display: "block" }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
