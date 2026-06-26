import type { Metadata } from "next";
import Stripe from "stripe";
import { CreditCard, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCachedProfile } from "@/lib/supabase/profile";
import { devError } from "@/lib/log";

export const metadata: Metadata = {
  title: "Abonnement - Estime",
};

const PAYMENT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;
const CUSTOMER_PORTAL_URL = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL;

async function getRenewalDate(subscriptionId: string | null) {
  if (!subscriptionId) return null;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const periodEnd = subscription.items.data[0]?.current_period_end;
    return periodEnd ? new Date(periodEnd * 1000) : null;
  } catch (error) {
    devError("abonnement: échec de la récupération de la date de renouvellement", error);
    return null;
  }
}

export default async function Abonnement({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase, user } = await getCurrentUser();

  const profile = await getCachedProfile<{
    trial_end: string | null;
    is_subscribed: boolean;
    subscription_id: string | null;
  }>(supabase, user!.id, "trial_end, is_subscribed, subscription_id");

  const isSubscribed = profile?.is_subscribed ?? false;
  const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null;
  const daysLeft = trialEnd
    ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const trialExpired = !isSubscribed && daysLeft <= 0;
  const renewalDate = isSubscribed
    ? await getRenewalDate(profile?.subscription_id ?? null)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Abonnement</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Votre formule et vos informations de facturation.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <WarningCircle size={20} className="text-red-500 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-dusk/8 py-16 px-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-ambre/10 rounded-full flex items-center justify-center mb-5">
          <CreditCard size={26} className="text-ambre" aria-hidden="true" />
        </div>

        {isSubscribed ? (
          <>
            <h2 className="font-display text-xl font-bold text-dusk mb-2">
              Abonnement actif
            </h2>
            <p className="text-dusk/50 text-sm max-w-[40ch] mb-2">
              Votre abonnement Estime à 24,99€/mois est actif.
            </p>
            {renewalDate && (
              <p className="text-dusk/50 text-sm max-w-[40ch] mb-6">
                Prochain renouvellement le{" "}
                <span className="font-semibold text-dusk">
                  {renewalDate.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                .
              </p>
            )}
            <a
              href={CUSTOMER_PORTAL_URL}
              className="inline-flex items-center justify-center bg-dusk text-white font-semibold text-base px-7 py-3.5 rounded-full hover:bg-dusk/90 active:scale-[0.98] transition-all duration-200"
            >
              Gérer mon abonnement
            </a>
          </>
        ) : trialExpired ? (
          <>
            <h2 className="font-display text-xl font-bold text-dusk mb-2">
              Votre accès est suspendu
            </h2>
            <p className="text-dusk/50 text-sm max-w-[40ch] mb-6">
              Votre essai gratuit de 14 jours est terminé. Abonnez-vous pour
              retrouver l&apos;accès complet à Estime.
            </p>
            <PricingCard />
            <a
              href={PAYMENT_LINK_URL}
              className="mt-6 inline-flex items-center justify-center bg-braise text-white font-semibold text-base px-8 py-4 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200 animate-pulse"
            >
              Réactiver mon accès maintenant
            </a>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold text-dusk mb-2">
              Votre essai se termine dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}
            </h2>
            <p className="text-dusk/50 text-sm max-w-[40ch] mb-6">
              Abonnez-vous dès maintenant pour ne perdre aucun accès à la fin
              de votre période d&apos;essai.
            </p>
            <PricingCard />
            <a
              href={PAYMENT_LINK_URL}
              className="mt-6 inline-flex items-center justify-center bg-braise text-white font-semibold text-base px-8 py-4 rounded-full hover:bg-ambre active:scale-[0.98] transition-all duration-200"
            >
              S&apos;abonner maintenant
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function PricingCard() {
  return (
    <div className="bg-dust rounded-xl border border-dusk/8 px-8 py-6 w-full max-w-sm">
      <p className="font-display text-3xl font-bold text-dusk">
        24,99€<span className="text-base font-medium text-dusk/50">/mois</span>
      </p>
      <ul className="mt-4 space-y-2 text-left">
        {[
          "Génération illimitée de posts",
          "Relances d'avis automatiques",
          "Suivi du score de réputation",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-dusk/70">
            <CheckCircle weight="fill" size={16} className="text-ambre shrink-0" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
