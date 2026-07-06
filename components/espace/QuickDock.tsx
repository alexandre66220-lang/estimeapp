"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  InstagramLogo,
  UserPlus,
  Star,
} from "@phosphor-icons/react";

const DOCK_ITEMS = [
  {
    href: "/espace/nouveau-chantier",
    label: "Nouveau chantier",
    icon: Plus,
  },
  {
    href: "/espace/nouveau-chantier#generer",
    label: "Générer post",
    icon: InstagramLogo,
  },
  {
    href: "/espace/clients#ajouter",
    label: "Ajouter client",
    icon: UserPlus,
  },
  {
    href: "/espace/clients#avis",
    label: "Envoyer avis",
    icon: Star,
  },
];

const HIDDEN_PATHS = ["/espace/onboarding", "/espace/abonnement"];

export function QuickDock() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind dock */}
      <div className="h-[calc(64px+env(safe-area-inset-bottom,0px))] lg:hidden" aria-hidden="true" />

      <nav
        aria-label="Raccourcis rapides"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-2"
        style={{
          background: "rgba(43,37,33,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          height: "calc(64px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {DOCK_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href.split("#")[0];
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-150 min-w-[64px]"
              aria-label={label}
            >
              <Icon
                size={24}
                weight={isActive ? "fill" : "regular"}
                style={{ color: isActive ? "#C75D3B" : "rgba(255,255,255,0.55)" }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-medium leading-tight text-center"
                style={{ color: isActive ? "#C75D3B" : "rgba(255,255,255,0.45)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
