import Link from "next/link";
import ManageCookiesLink from "./ManageCookiesLink";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dusk py-10 border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

          <div>
            <p className="font-display text-lg font-bold text-dust mb-1">Estime</p>
            <p className="text-dust/35 text-sm">
              L'assistant post-chantier pour artisans du BTP.
            </p>
          </div>

          <nav aria-label="Liens du pied de page">
            <div className="flex flex-col sm:flex-row gap-y-6 gap-x-10">
              <div>
                <p className="text-dust/25 text-xs font-semibold uppercase tracking-wider mb-3">Navigation</p>
                <ul className="space-y-2" role="list">
                  <li>
                    <a href="/#comment-ca-marche" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                      Comment ça marche
                    </a>
                  </li>
                  <li>
                    <a href="/#tarif" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                      Tarif
                    </a>
                  </li>
                  <li>
                    <Link href="/faq" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-dust/25 text-xs font-semibold uppercase tracking-wider mb-3">Légal</p>
                <ul className="space-y-2" role="list">
                  <li>
                    <Link href="/mentions-legales" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                      Mentions légales
                    </Link>
                  </li>
                  <li>
                    <Link href="/cgv" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                      CGV
                    </Link>
                  </li>
                  <li>
                    <ManageCookiesLink className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200 text-left" />
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/8">
          <p className="text-dust/25 text-xs">
            &copy; {year} Estime par AlcalSpark. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
