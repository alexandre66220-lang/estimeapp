"use client";

import { List } from "@phosphor-icons/react";
import { useSidebar } from "./SidebarContext";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { toggle } = useSidebar();

  return (
    <header className="px-4 sm:px-8 py-6 border-b border-[#232326] flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label="Ouvrir le menu"
        className="lg:hidden -ml-1 p-1.5 rounded-md text-[#8B8B8D] hover:text-[#EDEDED] hover:bg-[#18181B] transition-colors duration-150"
      >
        <List size={20} weight="bold" />
      </button>
      <div>
        <h1 className="text-lg font-semibold text-[#EDEDED]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-[#8B8B8D]">{subtitle}</p>}
      </div>
    </header>
  );
}
