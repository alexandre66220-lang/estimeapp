"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Vue d'ensemble", href: "/backoffice" },
      { label: "Finances" },
      { label: "Estime" },
    ],
  },
  {
    label: "ALCALSPARK",
    items: [
      { label: "Clients" },
      { label: "Devis" },
      { label: "Factures" },
    ],
  },
  {
    label: "Outils",
    items: [
      { label: "Documents" },
      { label: "Sandbox" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-[#0C0C0D] border-r border-[#232326] flex flex-col py-5 px-3">
      <div className="px-2 mb-6">
        <span className="text-sm font-semibold text-[#EDEDED] tracking-tight">ALCALSPARK</span>
      </div>

      <nav className="flex flex-col gap-5">
        {SECTIONS.map((section, i) => (
          <div key={i}>
            {section.label && (
              <p className="px-2 mb-1.5 text-[11px] font-medium text-[#55555A] uppercase tracking-wide">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = item.href && pathname === item.href;

                if (!item.href) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-[#55555A]"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#55555A] border border-[#232326] rounded-full px-1.5 py-0.5">
                        bientôt
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-2 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                      isActive
                        ? "bg-[#4ADE80]/10 text-[#4ADE80] font-medium"
                        : "text-[#8B8B8D] hover:text-[#EDEDED] hover:bg-[#18181B]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
