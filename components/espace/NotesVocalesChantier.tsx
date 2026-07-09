"use client";

import { useTransition } from "react";
import { Trash } from "@phosphor-icons/react";
import { NoteVocaleModal } from "./NoteVocaleModal";
import { supprimerNoteVocale } from "@/app/actions/notes-vocales";

function formatDuree(secondes: number | null): string {
  if (secondes === null) return "";
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type NoteVocaleRow = {
  id: string;
  created_at: string;
  duree_secondes: number | null;
  audioUrl: string | null;
};

export function NotesVocalesChantier({
  chantierId,
  notes,
}: {
  chantierId: string;
  notes: NoteVocaleRow[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await supprimerNoteVocale(id);
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="font-display text-lg font-bold text-dusk mb-1">Notes vocales</h2>
          <p className="text-dusk/45 text-xs">Mémos audio enregistrés pour ce chantier</p>
        </div>
        <NoteVocaleModal chantierId={chantierId} />
      </div>

      {notes.length === 0 ? (
        <p className="text-dusk/40 text-sm">Aucune note vocale pour ce chantier.</p>
      ) : (
        <div className="divide-y divide-dusk/8">
          {notes.map((note) => (
            <div key={note.id} className="flex items-center gap-4 py-3.5">
              <div className="min-w-0 flex-1">
                {note.audioUrl && <audio src={note.audioUrl} controls className="w-full h-9" />}
                <p className="text-xs text-dusk/40 mt-1">
                  {new Date(note.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {note.duree_secondes !== null && ` · ${formatDuree(note.duree_secondes)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={isPending}
                className="p-2 rounded-xl text-dusk/40 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 disabled:opacity-50"
                aria-label="Supprimer la note vocale"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
