"use client";

import { useEffect } from "react";

const COLOR_TO_MANIFEST: Record<string, string> = {
  "#C75D3B": "/manifest-terracotta.json",
  "#385144": "/manifest-vert.json",
  "#2D4A6B": "/manifest-bleu.json",
  "#7B2D3E": "/manifest-bordeaux.json",
  "#C8922A": "/manifest-ocre.json",
  "#3D3D3D": "/manifest-anthracite.json",
};

const COLOR_TO_APPLE_ICON: Record<string, string> = {
  "#C75D3B": "/icons/apple-touch-icon-terracotta.svg",
  "#385144": "/icons/apple-touch-icon-vert.svg",
  "#2D4A6B": "/icons/apple-touch-icon-bleu.svg",
  "#7B2D3E": "/icons/apple-touch-icon-bordeaux.svg",
  "#C8922A": "/icons/apple-touch-icon-ocre.svg",
  "#3D3D3D": "/icons/apple-touch-icon-anthracite.svg",
};

export function DynamicManifest({ themeColor }: { themeColor: string }) {
  useEffect(() => {
    const manifest = COLOR_TO_MANIFEST[themeColor] ?? "/manifest-terracotta.json";
    const appleIcon = COLOR_TO_APPLE_ICON[themeColor] ?? "/icons/apple-touch-icon-terracotta.svg";

    // Update manifest link
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = manifest;

    // Update apple-touch-icon
    let appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }
    appleLink.href = appleIcon;

    // Update theme-color meta
    let themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = themeColor;
  }, [themeColor]);

  return null;
}
