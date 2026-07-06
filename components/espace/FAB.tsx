"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "@phosphor-icons/react";

const HIDDEN_PREFIXES = [
  "/espace/nouveau-chantier",
  "/espace/onboarding",
  "/espace/abonnement",
];

export function FAB() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <Link
      href="/espace/nouveau-chantier"
      aria-label="Nouveau chantier"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-braise text-white rounded-full flex items-center justify-center shadow-lg shadow-braise/30 hover:bg-ambre hover:scale-110 active:scale-95 transition-all duration-200"
    >
      <Plus size={24} weight="bold" aria-hidden="true" />
    </Link>
  );
}
