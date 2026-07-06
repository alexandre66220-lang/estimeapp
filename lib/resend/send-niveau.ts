import "server-only";
import { Resend } from "resend";
import type { NiveauFidelite } from "@/lib/fidelite/constants";
import { NIVEAUX_FIDELITE } from "@/lib/fidelite/constants";

const FROM = `Estime <${process.env.RESEND_FROM_EMAIL || "noreply@estime-app.com"}>`;

export async function sendNiveauEmail(params: {
  email: string;
  prenom: string;
  niveau: NiveauFidelite;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const niveauInfo = NIVEAUX_FIDELITE[params.niveau];

  const recompenses: Partial<Record<NiveauFidelite, string>> = {
    confirme: "Vous avez désormais accès en avant-première aux nouvelles fonctionnalités d'Estime.",
    expert:   "Un mois d'abonnement vous est offert — il sera appliqué automatiquement sur votre prochain renouvellement.",
    maitre:   "Le badge « Artisan Expert Estime » apparaît maintenant sur votre page vitrine publique.",
    legende:  "Deux mois d'abonnement vous sont offerts et votre nom apparaîtra sur la landing page d'Estime parmi nos meilleurs artisans.",
  };

  const recompense = recompenses[params.niveau] ?? "";

  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `${niveauInfo.emoji} Félicitations, vous êtes maintenant ${niveauInfo.label} sur Estime !`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C2C2C">
        <div style="background:#C75D3B;padding:24px 32px;border-radius:12px 12px 0 0">
          <p style="color:#fff;font-size:28px;margin:0;font-weight:bold">ESTIME</p>
        </div>
        <div style="background:#FAF7F5;padding:32px;border-radius:0 0 12px 12px">
          <p style="font-size:32px;margin:0 0 8px">${niveauInfo.emoji}</p>
          <h1 style="font-size:22px;margin:0 0 8px">Félicitations, ${params.prenom} !</h1>
          <p style="color:#7A6E6A;margin:0 0 20px">
            Vous venez d'atteindre le niveau <strong>${niveauInfo.label}</strong> sur le programme de fidélité Estime.
          </p>
          ${recompense ? `
          <div style="background:#fff;border-left:4px solid #C75D3B;padding:16px;border-radius:4px;margin-bottom:20px">
            <p style="margin:0;font-size:14px">${recompense}</p>
          </div>
          ` : ""}
          <p style="color:#7A6E6A;font-size:13px">Continuez à utiliser Estime pour progresser vers le niveau suivant.</p>
          <a href="${process.env.NEXT_PUBLIC_URL ?? "https://estime-app.com"}/espace/fidelite"
             style="display:inline-block;background:#C75D3B;color:#fff;padding:12px 24px;border-radius:100px;text-decoration:none;font-weight:600;margin-top:8px">
            Voir mon programme fidélité
          </a>
        </div>
      </div>
    `,
  });
}
