"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "@phosphor-icons/react";

const DISMISSED_KEY = "estime_install_banner_dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (!isMobile()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#C75D3B]/8 border border-[#C75D3B]/15">
      <span className="text-xl shrink-0">📲</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dusk leading-tight">
          Installez Estime sur votre écran d&apos;accueil
        </p>
        <p className="text-xs text-dusk/55 mt-0.5">Pour un accès rapide comme une vraie app</p>
      </div>
      <Link
        href="/espace/installer"
        className="shrink-0 px-3 py-1.5 rounded-full bg-[#C75D3B] text-white text-xs font-semibold hover:bg-[#B8552E] transition-colors"
      >
        Comment ?
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="shrink-0 text-dusk/30 hover:text-dusk/60 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
