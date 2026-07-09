"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Microphone, MagnifyingGlass, Image as ImageIcon } from "@phosphor-icons/react";
import { NoteVocaleModal } from "./NoteVocaleModal";
import { ScannerMateriauModal } from "./ScannerMateriauModal";
import { AjouterPhotoChantierModal } from "./AjouterPhotoChantierModal";

type Chantier = { id: string; titre: string };

const HIDDEN_PATHS = ["/espace/onboarding", "/espace/abonnement"];

const ITEM_CLASS =
  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-150 min-w-[64px]";

export function QuickDock({ chantiers }: { chantiers: Chantier[] }) {
  const pathname = usePathname();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  const isChantierActive = pathname === "/espace/nouveau-chantier";

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
        <Link href="/espace/nouveau-chantier" className={ITEM_CLASS} aria-label="Chantier">
          <Plus
            size={24}
            weight={isChantierActive ? "fill" : "regular"}
            style={{ color: isChantierActive ? "#C75D3B" : "rgba(255,255,255,0.55)" }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-medium leading-tight text-center"
            style={{ color: isChantierActive ? "#C75D3B" : "rgba(255,255,255,0.45)" }}
          >
            Chantier
          </span>
        </Link>

        <NoteVocaleModal
          chantiers={chantiers}
          trigger={
            <button type="button" className={ITEM_CLASS} aria-label="Note vocale">
              <Microphone size={24} style={{ color: "rgba(255,255,255,0.55)" }} aria-hidden="true" />
              <span
                className="text-[10px] font-medium leading-tight text-center"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Note vocale
              </span>
            </button>
          }
        />

        <ScannerMateriauModal
          chantiers={chantiers}
          trigger={
            <button type="button" className={ITEM_CLASS} aria-label="Scanner">
              <MagnifyingGlass size={24} style={{ color: "rgba(255,255,255,0.55)" }} aria-hidden="true" />
              <span
                className="text-[10px] font-medium leading-tight text-center"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Scanner
              </span>
            </button>
          }
        />

        <AjouterPhotoChantierModal
          chantiers={chantiers}
          trigger={
            <button type="button" className={ITEM_CLASS} aria-label="Photo">
              <ImageIcon size={24} style={{ color: "rgba(255,255,255,0.55)" }} aria-hidden="true" />
              <span
                className="text-[10px] font-medium leading-tight text-center"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Photo
              </span>
            </button>
          }
        />
      </nav>
    </>
  );
}
