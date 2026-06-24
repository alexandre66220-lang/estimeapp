import Link from "next/link";
import ManageCookiesLink from "./ManageCookiesLink";

export default function Footer() {
  return (
    <footer className="bg-noir py-10 border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <p className="font-landing-display text-lg font-semibold text-dust">
            Estime
          </p>

          <nav aria-label="Liens du pied de page">
            <ul className="flex flex-wrap gap-x-8 gap-y-2" role="list">
              <li>
                <Link href="/mentions-legales" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <ManageCookiesLink className="text-dust/45 text-sm hover:text-dust/75 transition-colors duration-200 text-left" />
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/8">
          <p className="text-dust/25 text-xs">
            © 2026 Estime — Développé par AlcalSpark.
          </p>
        </div>
      </div>
    </footer>
  );
}
