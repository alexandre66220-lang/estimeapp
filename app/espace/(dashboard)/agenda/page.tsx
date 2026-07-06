import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { AgendaCalendar, type AgendaChantier } from "@/components/espace/AgendaCalendar";

export const metadata: Metadata = {
  title: "Agenda - Estime",
};

export default async function AgendaPage() {
  const { supabase, user } = await getCurrentUser();

  const { data } = await supabase
    .from("chantiers")
    .select("id, titre, statut, date_debut, date_fin, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const chantiers: AgendaChantier[] = (data ?? []).map((c) => ({
    id: c.id,
    titre: c.titre ?? "Chantier sans titre",
    statut: c.statut ?? "brouillon",
    date_debut: c.date_debut ?? null,
    date_fin: c.date_fin ?? null,
    created_at: c.created_at,
  }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dusk">Agenda</h1>
        <p className="text-dusk/50 text-sm mt-1">
          Vue mensuelle de vos chantiers. Cliquez sur un jour pour voir le détail.
        </p>
      </div>
      <AgendaCalendar chantiers={chantiers} />
    </div>
  );
}
