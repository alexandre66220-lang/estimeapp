"use client";

import { useState, useTransition, useRef } from "react";
import { Trash, Note } from "@phosphor-icons/react";
import { addNoteChantier, deleteNoteChantier } from "@/app/actions/notes-chantier";

type Note = {
  id: string;
  contenu: string;
  created_at: string;
};

export function NotesChantier({
  chantierId,
  initialNotes,
}: {
  chantierId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [contenu, setContenu] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleAdd() {
    if (!contenu.trim()) return;
    const optimisticNote: Note = {
      id: `tmp-${Date.now()}`,
      contenu: contenu.trim(),
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [optimisticNote, ...prev]);
    setContenu("");
    setError(null);

    startTransition(async () => {
      const result = await addNoteChantier(chantierId, optimisticNote.contenu);
      if (result.error) {
        setError(result.error);
        setNotes((prev) => prev.filter((n) => n.id !== optimisticNote.id));
        setContenu(optimisticNote.contenu);
      }
    });
  }

  function handleDelete(noteId: string) {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    startTransition(async () => {
      const result = await deleteNoteChantier(noteId, chantierId);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Note size={18} className="text-dusk/50" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-dusk">Mes notes</h2>
        {notes.length > 0 && (
          <span className="ml-auto text-xs text-dusk/35">{notes.length}/30</span>
        )}
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <textarea
          ref={textareaRef}
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          maxLength={2000}
          placeholder="Problèmes rencontrés, matériaux utilisés, observations... (⌘+Entrée pour envoyer)"
          className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust/50 text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-[#C75D3B]/20 focus:border-[#C75D3B]/40 transition-all resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          {error ? (
            <p className="text-red-500 text-xs">{error}</p>
          ) : (
            <span className="text-xs text-dusk/30">{contenu.length}/2000</span>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !contenu.trim() || notes.length >= 30}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "#C75D3B" }}
          >
            Ajouter une note
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-dusk/40 text-sm text-center py-4">
          Aucune note pour ce chantier.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="group flex gap-3 p-4 rounded-xl bg-dust/50 border border-dusk/6">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dusk whitespace-pre-wrap break-words">{note.contenu}</p>
                <p className="text-xs text-dusk/35 mt-1.5">
                  {new Date(note.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={isPending || note.id.startsWith("tmp-")}
                aria-label="Supprimer la note"
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-dusk/30 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
              >
                <Trash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
