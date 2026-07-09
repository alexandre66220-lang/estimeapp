import type { Metadata } from "next";
import { CalculateurSurface } from "@/components/espace/CalculateurSurface";

export const metadata: Metadata = {
  title: "Calculateur de surface, Estime",
};

export default function CalculateurPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Calculateur de surface</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Calculez la surface d&apos;un chantier selon sa forme, avec estimation peinture incluse.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
        <CalculateurSurface />
      </div>
    </div>
  );
}
