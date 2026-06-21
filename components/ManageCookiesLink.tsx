"use client";

import { reopenCookieBanner } from "@/lib/consent/cookies";

export default function ManageCookiesLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={reopenCookieBanner}
      className={`bg-transparent border-0 p-0 m-0 font-sans cursor-pointer ${className}`}
    >
      Gérer mes cookies
    </button>
  );
}
