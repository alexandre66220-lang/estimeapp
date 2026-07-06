export type FaqItem = { q: string; a: string };

export const FAQ_BY_CATEGORY: Record<string, FaqItem[]> = {
  Réputation: [
    {
      q: "Comment obtenir plus d'avis Google ?",
      a: "Envoyez une demande par SMS ou email dans les 48h après chaque chantier avec un lien direct vers votre fiche Google. Estime automatise cet envoi.",
    },
    {
      q: "Combien d'avis Google faut-il pour être bien référencé ?",
      a: "Un minimum de 10 avis à 4.5 étoiles suffit pour améliorer significativement votre positionnement local sur Google.",
    },
    {
      q: "Comment répondre à un avis négatif ?",
      a: "Restez professionnel, remerciez pour le retour, expliquez la situation et proposez de régler le problème hors ligne.",
    },
  ],
  Marketing: [
    {
      q: "Instagram est-il utile pour un artisan ?",
      a: "Oui, Instagram est très efficace pour les métiers visuels du BTP. Les photos avant/après génèrent de l'engagement et des demandes de devis locaux.",
    },
    {
      q: "Combien de fois par semaine faut-il publier sur Instagram ?",
      a: "Un post par semaine suffit pour maintenir une présence active. La régularité est plus importante que la fréquence.",
    },
    {
      q: "Quels hashtags utiliser pour un artisan ?",
      a: "Combinez hashtags locaux (#peintrecastres), hashtags de métier (#peintrebtp) et hashtags de projet (#renovationmaison). Visez 8 à 12 hashtags par post.",
    },
  ],
  Gestion: [
    {
      q: "Quel statut choisir quand on est artisan ?",
      a: "L'auto-entrepreneur est idéal pour démarrer. Au-delà de 50 000€ de CA annuel, consultez un comptable pour étudier le passage en EURL ou SASU.",
    },
    {
      q: "Comment calculer son tarif journalier ?",
      a: "Divisez vos charges fixes annuelles + salaire souhaité par votre nombre de jours facturables réels (environ 195 jours/an). C'est votre tarif minimum.",
    },
    {
      q: "Comment gérer sa trésorerie quand on est artisan ?",
      a: "Demandez toujours un acompte de 30% à la signature, facturez le jour de la fin du chantier, et mettez de côté 22-25% de chaque encaissement pour les charges sociales.",
    },
  ],
  Technique: [
    {
      q: "Comment préparer une surface avant de peindre ?",
      a: "Dégaissez, rebouchez les fissures, poncez, dépoussiérez et appliquez une impression. Ces étapes garantissent l'adhérence et la durabilité de la peinture.",
    },
    {
      q: "Quelle épaisseur pour un enduit extérieur ?",
      a: "Entre 15 et 20mm pour un enduit monocouche. En dessous il sera fragile, au-dessus il risque de se fissurer par retrait.",
    },
    {
      q: "Comment détecter une fuite d'eau cachée ?",
      a: "Fermez tous les robinets, relevez l'index du compteur et attendez 2 heures. Si l'index a bougé, il y a une fuite. Utilisez ensuite une caméra thermique pour la localiser.",
    },
  ],
  Sécurité: [
    {
      q: "Quels équipements de protection sont obligatoires sur un chantier ?",
      a: "Casque, chaussures de sécurité, gants et gilet haute visibilité sont obligatoires. Des EPI spécifiques s'ajoutent selon les risques : harnais en hauteur, masque pour poussières ou produits chimiques.",
    },
    {
      q: "Quelles sont les obligations de l'artisan en matière de sécurité ?",
      a: "Vous devez évaluer les risques, former vos salariés, fournir les EPI adaptés et afficher les consignes de sécurité sur le chantier.",
    },
    {
      q: "Comment prévenir les risques de chute en hauteur ?",
      a: "Utilisez des échafaudages homologués, des harnais antichute vérifiés et installez des garde-corps. Ne travaillez jamais en hauteur seul.",
    },
  ],
};

export const FAQ_LANDING: FaqItem[] = [
  {
    q: "Estime est-il gratuit ?",
    a: "Estime propose un essai gratuit de 14 jours sans carte bancaire. L'abonnement est ensuite de 24,99€/mois.",
  },
  {
    q: "Pour quels métiers du BTP Estime est-il adapté ?",
    a: "Estime est conçu pour tous les artisans du BTP : peintres, plombiers, électriciens, maçons, carreleurs, couvreurs et menuisiers.",
  },
  {
    q: "Comment Estime génère-t-il les posts Instagram ?",
    a: "Vous prenez une photo de votre chantier, Estime analyse l'image et génère automatiquement un texte professionnel avec les bons hashtags selon votre métier et votre ville.",
  },
  {
    q: "Estime fonctionne-t-il sur iPhone et Android ?",
    a: "Oui, Estime est une application web progressive (PWA) qui fonctionne sur tous les appareils : iPhone, Android et ordinateur.",
  },
  {
    q: "Comment obtenir des avis Google avec Estime ?",
    a: "Estime envoie automatiquement un email personnalisé à votre client dès que vous marquez un chantier comme terminé, avec votre lien Google direct.",
  },
];

export const FAQ_FONCTIONNALITES: FaqItem[] = [
  {
    q: "Estime génère-t-il vraiment les posts Instagram automatiquement ?",
    a: "Oui. Vous uploadez une photo de chantier, l'IA analyse l'image, reconnaît le métier et génère un texte professionnel prêt à publier avec les bons hashtags, en moins de 15 secondes.",
  },
  {
    q: "Comment fonctionne la page vitrine publique ?",
    a: "Chaque artisan abonné dispose d'une page publique personnalisée (estime-app.com/artisan/votre-nom) affichant vos réalisations, vos avis Google et votre score de réputation. Vous pouvez la partager à vos prospects.",
  },
  {
    q: "Qu'est-ce que le score de réputation Estime ?",
    a: "C'est un score sur 1000 points calculé à partir de vos avis Google, de la fréquence de vos publications et de vos chantiers réalisés. Il évolue en temps réel et vous permet de vous comparer aux autres artisans de votre ville.",
  },
  {
    q: "Est-il possible d'importer mes clients existants ?",
    a: "Oui, vous pouvez importer votre carnet de contacts depuis un fichier CSV. Estime s'occupe ensuite d'envoyer les demandes d'avis Google à chaque client.",
  },
  {
    q: "Estime s'intègre-t-il avec d'autres outils ?",
    a: "Estime fonctionne de manière autonome. Il se connecte directement à votre fiche Google My Business pour les avis, sans nécessiter d'autre outil.",
  },
];

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
