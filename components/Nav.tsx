import Link from "next/link";

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-creme/90 backdrop-blur-sm border-b border-charbon/8">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-bold text-charbon tracking-tight hover:text-terracotta transition-colors duration-200"
          aria-label="Estime - Retour à l'accueil"
        >
          Estime
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
          <a
            href="/#comment-ca-marche"
            className="text-sm font-medium text-charbon/70 hover:text-charbon transition-colors duration-200"
          >
            Comment ça marche
          </a>
          <a
            href="/#tarif"
            className="text-sm font-medium text-charbon/70 hover:text-charbon transition-colors duration-200"
          >
            Tarif
          </a>
          <Link
            href="/faq"
            className="text-sm font-medium text-charbon/70 hover:text-charbon transition-colors duration-200"
          >
            FAQ
          </Link>
        </nav>

        <a
          href="/#liste-attente"
          className="inline-flex items-center justify-center bg-terracotta-dark text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-terracotta active:scale-[0.97] transition-all duration-200"
          aria-label="Rejoindre la liste d'attente Estime"
        >
          Liste d'attente
        </a>
      </div>
    </header>
  );
}
