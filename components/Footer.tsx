export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charbon py-10 border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

          <div>
            <p className="font-display text-lg font-bold text-creme mb-1">Estime</p>
            <p className="text-creme/35 text-sm">
              L'assistant post-chantier pour artisans du BTP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <nav aria-label="Liens du pied de page">
              <ul className="flex flex-wrap gap-4 sm:gap-6" role="list">
                <li>
                  <a
                    href="#comment-ca-marche"
                    className="text-creme/40 text-sm hover:text-creme/70 transition-colors duration-200"
                  >
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <a
                    href="#tarif"
                    className="text-creme/40 text-sm hover:text-creme/70 transition-colors duration-200"
                  >
                    Tarif
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@estime.app"
                    className="text-creme/40 text-sm hover:text-creme/70 transition-colors duration-200"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/8">
          <p className="text-creme/25 text-xs">
            {year} Estime. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
