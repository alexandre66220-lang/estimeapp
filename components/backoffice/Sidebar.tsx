"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

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
      { label: "Clients", href: "/backoffice/clients" },
      { label: "Devis", href: "/backoffice/devis" },
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
  const { open, close } = useSidebar();

  return (
    <>
      {/* Backdrop mobile/tablette : cliquer dessus referme le menu */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] shrink-0 bg-[#0C0C0D] border-r border-[#232326] flex flex-col py-5 px-3 transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
                  const isActive =
                    item.href &&
                    (item.href === "/backoffice"
                      ? pathname === item.href
                      : pathname.startsWith(item.href));

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
                      onClick={close}
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
    </>
  );
}
