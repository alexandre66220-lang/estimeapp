import Link from "next/link";

interface TrialBannerProps {
  trialEnd: string | null;
  isSubscribed: boolean;
}

export default function TrialBanner({ trialEnd, isSubscribed }: TrialBannerProps) {
  if (isSubscribed || !trialEnd) return null;

  const daysLeft = Math.ceil(
    (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) return null;

  return (
    <div className="bg-ambre/15 border-b border-ambre/20 px-6 py-2.5">
      <p className="text-sm text-dusk text-center font-medium">
        🎉 Essai gratuit — Il vous reste {daysLeft} jour{daysLeft > 1 ? "s" : ""}.{" "}
        <Link href="/espace/abonnement" className="text-braise hover:underline font-semibold">
          S&apos;abonner pour continuer →
        </Link>
      </p>
    </div>
  );
}
