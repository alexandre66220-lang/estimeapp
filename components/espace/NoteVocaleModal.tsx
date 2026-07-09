"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { X, Microphone, Stop, Check, Warning, Trash } from "@phosphor-icons/react";
import { enregistrerNoteVocale, associerNoteVocale } from "@/app/actions/notes-vocales";

type Chantier = { id: string; titre: string };

function formatDuree(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function NoteVocaleModal({
  chantierId,
  chantiers,
  trigger,
}: {
  chantierId?: string;
  chantiers?: Chantier[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [statut, setStatut] = useState<"idle" | "enregistrement" | "pret">("idle");
  const [dureeEcoulee, setDureeEcoulee] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [noteId, setNoteId] = useState<string | null>(null);
  const [chantierAssocie, setChantierAssocie] = useState("");
  const [associationSauvegardee, setAssociationSauvegardee] = useState(false);
  const [isAssociating, startAssociating] = useTransition();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chantierPreselectionne = Boolean(chantierId);

  function reset() {
    setStatut("idle");
    setDureeEcoulee(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setError(null);
    setNoteId(null);
    setChantierAssocie("");
    setAssociationSauvegardee(false);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatut("pret");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatut("enregistrement");
      setDureeEcoulee(0);
      timerRef.current = setInterval(() => setDureeEcoulee((d) => d + 1), 1000);
    } catch {
      setError("Impossible d'accéder au microphone. Vérifiez les autorisations de votre navigateur.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleSave() {
    if (!audioBlob) return;
    setError(null);
    const ext = audioBlob.type.includes("mp4") ? "mp4" : "webm";
    const file = new File([audioBlob], `note-vocale.${ext}`, { type: audioBlob.type });
    const formData = new FormData();
    formData.set("audio", file);
    formData.set("duree_secondes", String(dureeEcoulee));
    if (chantierId) formData.set("chantier_id", chantierId);

    startTransition(async () => {
      const result = await enregistrerNoteVocale(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNoteId(result.noteId ?? null);
    });
  }

  function handleAssocier() {
    if (!noteId || !chantierAssocie) return;
    startAssociating(async () => {
      const result = await associerNoteVocale(noteId, chantierAssocie);
      if (!result.error) setAssociationSauvegardee(true);
    });
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enregistrementTermine = Boolean(noteId);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          <Microphone size={16} weight="bold" />
          Note vocale
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dusk/8 shrink-0">
              <h2 className="font-display text-base font-bold text-dusk">Note vocale</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-dusk/40 hover:text-dusk transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {!enregistrementTermine && (
                <>
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    {statut === "idle" && (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full bg-braise text-white flex items-center justify-center hover:bg-ambre active:scale-95 transition-all duration-200"
                        aria-label="Démarrer l'enregistrement"
                      >
                        <Microphone size={32} weight="bold" />
                      </button>
                    )}

                    {statut === "enregistrement" && (
                      <>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse hover:bg-red-600 active:scale-95 transition-all duration-200"
                          aria-label="Arrêter l'enregistrement"
                        >
                          <Stop size={28} weight="fill" />
                        </button>
                        <p className="text-2xl font-bold text-dusk tabular-nums">{formatDuree(dureeEcoulee)}</p>
                        <p className="text-xs text-dusk/45">Enregistrement en cours…</p>
                      </>
                    )}

                    {statut === "pret" && audioUrl && (
                      <>
                        <audio src={audioUrl} controls className="w-full" />
                        <p className="text-sm text-dusk/50">Durée : {formatDuree(dureeEcoulee)}</p>
                        <button
                          type="button"
                          onClick={reset}
                          className="inline-flex items-center gap-1.5 text-xs text-dusk/40 hover:text-red-500 transition-colors"
                        >
                          <Trash size={13} />
                          Recommencer
                        </button>
                      </>
                    )}
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1.5">
                      <Warning size={14} weight="fill" />
                      {error}
                    </p>
                  )}

                  {statut === "pret" && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isPending}
                      className="w-full py-3 bg-braise text-white text-sm font-semibold rounded-full hover:bg-ambre transition-colors disabled:opacity-50"
                    >
                      {isPending ? "Enregistrement en cours…" : "Enregistrer la note"}
                    </button>
                  )}
                </>
              )}

              {enregistrementTermine && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                    <Check size={20} weight="bold" className="text-green-600 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Note vocale enregistrée</p>
                  </div>

                  {chantierPreselectionne ? (
                    <p className="text-xs text-dusk/45 text-center">Ajoutée au chantier en cours.</p>
                  ) : associationSauvegardee ? (
                    <p className="text-xs text-green-600 font-medium text-center">Associée au chantier</p>
                  ) : chantiers && chantiers.length > 0 ? (
                    <div className="space-y-2 rounded-xl bg-dust/60 border border-dusk/8 p-3">
                      <label className="block text-xs text-dusk/50">Associer à un chantier (optionnel)</label>
                      <div className="flex gap-2">
                        <select
                          value={chantierAssocie}
                          onChange={(e) => setChantierAssocie(e.target.value)}
                          className="flex-1 px-3 py-2 border border-dusk/15 rounded-xl text-sm text-dusk focus:outline-none focus:ring-2 focus:ring-braise/30 bg-white"
                        >
                          <option value="">Aucun chantier</option>
                          {chantiers.map((c) => (
                            <option key={c.id} value={c.id}>{c.titre}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleAssocier}
                          disabled={!chantierAssocie || isAssociating}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-braise text-white text-sm font-semibold rounded-xl hover:bg-ambre transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Check size={14} weight="bold" />
                          {isAssociating ? "…" : "OK"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 border border-dusk/15 text-sm text-dusk/60 font-medium rounded-full hover:bg-dust/50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
