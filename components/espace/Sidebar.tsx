"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  HardHat,
  User,
  AddressBook,
  GearSix,
  CreditCard,
  Gift,
  SealCheck,
  Star,
  SignOut,
  List,
  X,
  CurrencyEur,
  FilePdf,
  Trophy,
  Globe,
  Lightbulb,
  DeviceMobile,
  Ruler,
  CalendarBlank as CalendarBlankIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { logout } from "@/app/actions/auth";
import { PresentationModeButton } from "@/components/espace/PresentationModeProvider";

const NAV_ITEMS: { href: string; label: string; icon: PhosphorIcon }[] = [
  { href: "/espace/tableau-de-bord", label: "Tableau de bord", icon: SquaresFour },
  { href: "/espace/mes-chantiers", label: "Mes chantiers", icon: HardHat },
  { href: "/espace/clients", label: "Mes clients", icon: AddressBook },
  { href: "/espace/finances", label: "Finances", icon: CurrencyEur },
  { href: "/espace/rapports", label: "Mes rapports", icon: FilePdf },
  { href: "/espace/parrainage", label: "Parrainage", icon: Gift },
  { href: "/espace/fidelite", label: "Fidélité", icon: Trophy },
  { href: "/espace/agenda", label: "Agenda", icon: CalendarBlankIcon },
  { href: "/espace/calculateur", label: "Calculateur m²", icon: Ruler },
  { href: "/espace/conseils", label: "Conseils", icon: Lightbulb },
  { href: "/espace/avis", label: "Mes Avis", icon: Star },
  { href: "/espace/badge", label: "Mon Badge", icon: SealCheck },
  { href: "/espace/profil", label: "Mon profil", icon: User },
  { href: "/annuaire", label: "Annuaire public", icon: Globe },
  { href: "/espace/installer", label: "Installer l'app", icon: DeviceMobile },
  { href: "/espace/parametres", label: "Paramètres", icon: GearSix },
  { href: "/espace/abonnement", label: "Abonnement", icon: CreditCard },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: PhosphorIcon;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
        active
          ? "bg-ambre/15 text-ambre"
          : "text-dust/55 hover:bg-white/5 hover:text-dust"
      }`}
    >
      <Icon size={20} weight={active ? "fill" : "regular"} aria-hidden="true" />
      {label}
    </Link>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dust/55 hover:bg-white/5 hover:text-dust transition-colors duration-200"
      >
        <SignOut size={20} aria-hidden="true" />
        Déconnexion
      </button>
    </form>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Barre mobile : toujours visible, jamais recouverte. Le menu s'ouvre sous elle. */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-dusk border-b border-white/8 flex items-center justify-between px-4">
        <Link
          href="/espace/tableau-de-bord"
          onClick={() => setOpen(false)}
          className="font-display text-lg font-bold text-dust tracking-tight"
        >
          Estime
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center rounded-full text-dust hover:bg-white/8 transition-colors duration-200"
        >
          {open ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
        </button>
      </div>

      {/* Sidebar desktop fixe */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:px-5 lg:py-6 bg-dusk border-r border-white/8 z-20">
        <div className="lumiere-fin-chantier absolute top-0 left-0 right-0 h-20 opacity-25 pointer-events-none" aria-hidden="true" />
        <Link
          href="/espace/tableau-de-bord"
          className="relative font-display text-xl font-bold text-dust tracking-tight mb-10 inline-block"
        >
          Estime
        </Link>
        <nav className="flex-1 flex flex-col gap-1" aria-label="Navigation de l'espace artisan">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              onNavigate={() => {}}
            />
          ))}
        </nav>
        <div className="border-t border-white/8 pt-4 mt-4">
          <PresentationModeButton className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dust/55 hover:bg-white/5 hover:text-dust transition-colors duration-200 mb-1" />
          <LogoutButton />
          <p className="text-white/20 text-xs mt-4 px-1">
            <a
              href="https://alcalspark.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/40 transition-colors duration-200"
            >
              Créé par AlcalSpark
            </a>
          </p>
        </div>
      </aside>

      {/* Panneau de navigation mobile : un seul calque opaque, pleine largeur,
          collé juste sous la barre fixe (top-16). Pas de rideau séparé ni de
          marges qui laisseraient deviner le contenu de la page en dessous. */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-[100] bg-dusk overflow-y-auto transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <nav className="px-5 py-6 flex flex-col gap-1" aria-label="Navigation de l'espace artisan">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
        <div className="border-t border-white/8 mx-5 pt-4">
          <PresentationModeButton className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-dust/55 hover:bg-white/5 hover:text-dust transition-colors duration-200 mb-1" />
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
