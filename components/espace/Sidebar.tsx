"use client";

import { useState } from "react";
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

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <>
      <Link
        href="/espace/tableau-de-bord"
        onClick={onNavigate}
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
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <form action={logout} className="border-t border-charbon/8 pt-4 mt-4">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-charbon/60 hover:bg-charbon/5 hover:text-charbon transition-colors duration-200"
        >
          <SignOut size={20} aria-hidden="true" />
          Déconnexion
        </button>
      </form>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barre mobile */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-white border-b border-charbon/8 flex items-center justify-between px-4">
        <Link
          href="/espace/tableau-de-bord"
          className="font-display text-lg font-bold text-charbon tracking-tight"
        >
          Estime
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="w-10 h-10 flex items-center justify-center rounded-full text-charbon hover:bg-charbon/5 transition-colors duration-200"
        >
          <List size={22} aria-hidden="true" />
        </button>
      </div>

      {/* Sidebar desktop fixe */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:px-5 lg:py-6 bg-white border-r border-charbon/8 z-20">
        <SidebarContent pathname={pathname} onNavigate={() => {}} />
      </aside>

      {/* Drawer mobile */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-charbon/40"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white px-5 py-6 flex flex-col shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-charbon/50 hover:bg-charbon/5 hover:text-charbon transition-colors duration-200"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
