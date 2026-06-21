"use client";

import { useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const FAQS = [
  {
    question: "Comment fonctionne Estime ?",
    answer:
      "Vous prenez une photo de votre chantier (avant/après ou en cours), vous la partagez dans l'application, et l'IA génère un post adapté à vos réseaux sociaux en moins de 30 secondes. La relance automatique d'avis Google s'active en quelques clics depuis votre tableau de bord : vos clients reçoivent un message personnalisé les invitant à partager leur expérience.",
  },
  {
    question: "Quels réseaux sociaux sont supportés ?",
    answer:
      "Estime génère des posts optimisés pour Instagram, Facebook et LinkedIn. Le texte est adapté au format et au ton de chaque plateforme. Vous pouvez le copier en un clic ou le publier directement depuis l'application.",
  },
  {
    question: "Combien de temps ça prend ?",
    answer:
      "Moins de 2 minutes du début à la fin. Vous prenez la photo, Estime génère le texte, vous le relisez rapidement et vous publiez. Pour les relances d'avis Google, tout est automatique une fois le client enregistré.",
  },
  {
    question: "Dois-je être à l'aise avec la technologie ?",
    answer:
      "Non. Estime est conçu pour des artisans, pas pour des experts du numérique. Si vous savez prendre une photo avec votre téléphone, vous savez utiliser Estime. L'interface est pensée pour être rapide à prendre en main, même en fin de journée de chantier.",
  },
  {
    question: "Mes données et photos sont-elles sécurisées ?",
    answer:
      "Oui. Vos photos et données sont hébergées en Europe, chiffrées en transit et au repos. Elles ne sont jamais partagées avec des tiers ni utilisées pour entraîner des modèles d'IA. Vous restez propriétaire de l'ensemble de vos contenus.",
  },
  {
    question: "Puis-je résilier facilement ?",
    answer:
      "Oui, sans engagement et sans justification requise. La résiliation se fait en un clic depuis votre espace client. Votre accès reste actif jusqu'à la fin de la période mensuelle en cours. Aucun frais de résiliation.",
  },
  {
    question: "Quand le service sera-t-il disponible ?",
    answer:
      "Estime est actuellement en développement. En rejoignant la liste d'attente dès maintenant, vous serez parmi les premiers informés du lancement et bénéficierez d'un tarif préférentiel réservé aux premiers inscrits.",
  },
  {
    question: "J'ai une question qui n'est pas dans cette FAQ.",
    answer:
      "Contactez-nous directement à contact@alcalspark.com. Nous répondons sous 48h ouvrées.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-dusk/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-dusk text-base group-hover:text-ambre transition-colors duration-200">
          {question}
        </span>
        <span className="shrink-0 mt-0.5 text-dusk/40 group-hover:text-ambre transition-colors duration-200">
          {open ? (
            <Minus size={18} weight="bold" aria-hidden="true" />
          ) : (
            <Plus size={18} weight="bold" aria-hidden="true" />
          )}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm text-dusk/65 leading-relaxed max-w-[60ch]">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-dust">
        <div className="bg-dusk pt-32 pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-dust leading-tight">
              Questions fréquentes
            </h1>
            <p className="mt-4 text-dust/50 text-lg max-w-[50ch]">
              Tout ce qu'un artisan veut savoir avant de se lancer.
            </p>
          </div>
        </div>
        <div className="lumiere-fin-chantier h-1" aria-hidden="true" />

        <div className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
          <div>
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="mt-12 bg-ambre/8 rounded-2xl p-8 border border-ambre/15">
            <p className="font-display text-xl font-bold text-dusk mb-2">
              Vous n'avez pas trouvé votre réponse ?
            </p>
            <p className="text-dusk/60 text-sm mb-5">
              Notre équipe répond sous 48h ouvrées.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
