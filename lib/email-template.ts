export const TEMPLATE_EMAIL_DEFAUT = `Bonjour {prenom_client},

C'est {prenom_artisan}, votre {metier}. J'espère que vous êtes satisfait du travail réalisé sur le chantier "{titre_chantier}".

Si vous avez quelques minutes, votre avis sur Google m'aiderait énormément à développer mon activité :
{lien_avis}

Merci beaucoup pour votre confiance.
{prenom_artisan}`;

export const VARIABLES_TEMPLATE_EMAIL = [
  { variable: "{prenom_client}", description: "Prénom du client" },
  { variable: "{prenom_artisan}", description: "Prénom de l'artisan" },
  { variable: "{metier}", description: "Métier de l'artisan" },
  { variable: "{lien_avis}", description: "Lien Google Business de l'artisan" },
  { variable: "{titre_chantier}", description: "Nom du chantier" },
] as const;

export function appliquerVariablesTemplate(
  template: string,
  values: {
    prenomClient: string;
    prenomArtisan: string;
    metier: string;
    lienAvis: string;
    titreChantier: string;
  }
) {
  return template
    .replaceAll("{prenom_client}", values.prenomClient)
    .replaceAll("{prenom_artisan}", values.prenomArtisan)
    .replaceAll("{metier}", values.metier)
    .replaceAll("{lien_avis}", values.lienAvis)
    .replaceAll("{titre_chantier}", values.titreChantier);
}
