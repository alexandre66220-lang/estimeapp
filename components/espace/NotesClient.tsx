"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Trash, NotePencil, CircleNotch } from "@phosphor-icons/react";
import { addNote, deleteNote } from "@/app/actions/crm";

type Note = { id: string; contenu: string; created_at: string };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
    >
      {pending ? <CircleNotch size={15} className="animate-spin" /> : <NotePencil size={15} weight="bold" />}
      {pending ? "Ajout…" : "Ajouter"}
    </button>
  );
}

function DeleteButton({ noteId, clientId }: { noteId: string; clientId: string }) {
  const { pending } = useFormStatus();
  return (
    <form action={deleteNote} className="shrink-0">
      <input type="hidden" name="noteId" value={noteId} />
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Supprimer cette note"
        className="w-8 h-8 flex items-center justify-center rounded-full text-dusk/30 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 disabled:opacity-50"
      >
        {pending ? (
          <CircleNotch size={14} className="animate-spin" />
        ) : (
          <Trash size={14} weight="bold" />
        )}
      </button>
    </form>
  );
}

export function NotesClient({
  clientId,
  notes,
}: {
  clientId: string;
  notes: Note[];
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div id="notes" className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-5">
        <NotePencil size={18} className="text-braise" weight="bold" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-dusk">Notes</h2>
        <span className="text-xs text-dusk/35 ml-1">({notes.length}/50)</span>
      </div>

      {/* Formulaire ajout */}
      {notes.length < 50 && (
        <form action={addNote} className="mb-6">
          <input type="hidden" name="clientId" value={clientId} />
          <textarea
            ref={textareaRef}
            name="contenu"
            rows={3}
            maxLength={2000}
            required
            placeholder="Ajouter une note sur ce client…"
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all resize-none mb-3"
          />
          <AddButton />
        </form>
      )}

      {/* Liste des notes */}
      {notes.length === 0 ? (
        <p className="text-dusk/40 text-sm">Aucune note pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-dust"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dusk whitespace-pre-wrap">{note.contenu}</p>
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
              <DeleteButton noteId={note.id} clientId={clientId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
