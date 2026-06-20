"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  HardHat,
  GearSix,
  CreditCard,
  SignOut,
  List,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { logout } from "@/app/actions/auth";

const NAV_ITEMS: { href: string; label: string; icon: PhosphorIcon }[] = [
  { href: "/espace/tableau-de-bord", label: "Tableau de bord", icon: SquaresFour },
  { href: "/espace/mes-chantiers", label: "Mes chantiers", icon: HardHat },
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
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
        active
          ? "bg-terracotta/10 text-terracotta-dark"
          : "text-charbon/60 hover:bg-charbon/5 hover:text-charbon"
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
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-charbon/60 hover:bg-charbon/5 hover:text-charbon transition-colors duration-200"
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
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-white border-b border-charbon/8 flex items-center justify-between px-4">
        <Link
          href="/espace/tableau-de-bord"
          onClick={() => setOpen(false)}
          className="font-display text-lg font-bold text-charbon tracking-tight"
        >
          Estime
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center rounded-full text-charbon hover:bg-charbon/5 transition-colors duration-200"
        >
          {open ? <X size={22} aria-hidden="true" /> : <List size={22} aria-hidden="true" />}
        </button>
      </div>

      {/* Sidebar desktop fixe */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:px-5 lg:py-6 bg-white border-r border-charbon/8 z-20">
        <Link
          href="/espace/tableau-de-bord"
          className="font-display text-xl font-bold text-charbon tracking-tight mb-10 inline-block"
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
        <div className="border-t border-charbon/8 pt-4 mt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Panneau de navigation mobile : un seul calque opaque, pleine largeur,
          collé juste sous la barre fixe (top-16). Pas de rideau séparé ni de
          marges qui laisseraient deviner le contenu de la page en dessous. */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-[100] bg-white overflow-y-auto transition-opacity duration-200 ${
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
        <div className="border-t border-charbon/8 mx-5 pt-4">
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
