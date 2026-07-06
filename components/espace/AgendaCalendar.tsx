"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, Plus, X } from "@phosphor-icons/react";

export type AgendaChantier = {
  id: string;
  titre: string;
  statut: string;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
};

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const STATUT_COLORS: Record<string, string> = {
  brouillon: "#9C9489",
  en_cours: "#C75D3B",
  terminé: "#385144",
  terminé_sans_post: "#C8922A",
};

function getEffectiveDate(c: AgendaChantier): string {
  return c.date_debut ?? c.created_at.slice(0, 10);
}

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function AgendaCalendar({ chantiers }: { chantiers: AgendaChantier[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const prevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 0) { setYear((y) => y - 1); return 11; }
      return m - 1;
    });
    setSelectedDay(null);
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 11) { setYear((y) => y + 1); return 0; }
      return m + 1;
    });
    setSelectedDay(null);
  }, []);

  const goToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build calendar grid (Mon-first)
  const firstDay = new Date(year, month, 1);
  // 0=Sun→6, 1=Mon→0, ..., 6=Sat→5
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? new Date(year, month, dayNum) : null);
  }

  // Map date string → chantiers
  const byDate = new Map<string, AgendaChantier[]>();
  for (const c of chantiers) {
    const key = getEffectiveDate(c);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(c);
  }

  const selectedChantiers = selectedDay
    ? (byDate.get(selectedDay.toISOString().slice(0, 10)) ?? [])
    : [];

  const selectedDateStr = selectedDay
    ? `${selectedDay.getDate()} ${MONTHS_FR[selectedDay.getMonth()]} ${selectedDay.getFullYear()}`
    : "";

  const newChantierUrl = selectedDay
    ? `/espace/nouveau-chantier?date=${selectedDay.toISOString().slice(0, 10)}`
    : "/espace/nouveau-chantier";

  return (
    <div className="space-y-4">
      {/* Header navigation */}
      <div className="bg-white rounded-2xl border border-dusk/8 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-dusk/10 hover:bg-dust/60 transition-colors"
              aria-label="Mois précédent"
            >
              <CaretLeft size={16} className="text-dusk/60" />
            </button>
            <h2 className="font-display text-lg font-bold text-dusk min-w-[180px] text-center">
              {MONTHS_FR[month]} {year}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-dusk/10 hover:bg-dust/60 transition-colors"
              aria-label="Mois suivant"
            >
              <CaretRight size={16} className="text-dusk/60" />
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="text-sm font-medium px-4 py-1.5 rounded-full border border-dusk/15 text-dusk/70 hover:bg-dust/60 transition-colors"
          >
            Aujourd&apos;hui
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_FR.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-dusk/35 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const key = day.toISOString().slice(0, 10);
            const events = byDate.get(key) ?? [];
            const isToday = sameDay(day, today);
            const isSelected = selectedDay ? sameDay(day, selectedDay) : false;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`relative flex flex-col items-center py-1.5 px-1 rounded-xl transition-colors min-h-[48px] ${
                  isSelected
                    ? "bg-[#C75D3B] text-white"
                    : isToday
                    ? "bg-[#C75D3B]/10 text-[#C75D3B]"
                    : "hover:bg-dust/70 text-dusk"
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? "text-white" : isToday ? "text-[#C75D3B] font-bold" : "text-dusk"}`}>
                  {day.getDate()}
                </span>
                {events.length > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-[#C75D3B]"}`}
                    aria-label={`${events.length} chantier${events.length > 1 ? "s" : ""}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-dusk">{selectedDateStr}</h3>
            <div className="flex items-center gap-2">
              <Link
                href={newChantierUrl}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#C75D3B] text-white hover:bg-[#B8552E] transition-colors"
              >
                <Plus size={14} />
                Nouveau chantier
              </Link>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-dust/60 transition-colors text-dusk/50"
                aria-label="Fermer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {selectedChantiers.length === 0 ? (
            <p className="text-dusk/45 text-sm">Aucun chantier ce jour.</p>
          ) : (
            <ul className="space-y-2">
              {selectedChantiers.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/espace/chantiers/${c.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-dust/60 transition-colors group"
                  >
                    <span className="text-sm font-medium text-dusk truncate group-hover:text-dusk">
                      {c.titre}
                    </span>
                    <span
                      className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ background: STATUT_COLORS[c.statut] ?? "#9C9489" }}
                    >
                      {c.statut.replace(/_/g, " ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
