"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

export default function PaymentSuccessToast() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      router.replace("/espace/tableau-de-bord");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2.5 bg-green-600 text-white font-medium text-sm px-5 py-3 rounded-full shadow-lg">
        <CheckCircle size={20} weight="fill" aria-hidden="true" />
        🎉 Bienvenue sur Estime ! Votre abonnement est actif.
      </div>
    </div>
  );
}
