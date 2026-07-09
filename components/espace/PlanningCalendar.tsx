"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, CalendarBlank, X, Clock, Trash, Star } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { getCreneauxRecommandes, RESEAU_META, type ReseauSocial } from "@/lib/planning/creneaux";

export type PostProgramme = {
  id: string;
  chantier_id: string | null;
  texte_post: string;
  hashtags: string[];
  image_url: string | null;
  date_publication: string;
  statut: "programme" | "publie" | "annule";
  chantier_titre?: string | null;
  reseau_social?: ReseauSocial | null;
};

export type ChantierPost = {
  chantier_id: string;
  chantier_titre: string;
  post_id: string;
  texte_post: string;
  hashtags: string[];
  image_url: string | null;
};

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const RESEAUX: { value: ReseauSocial; label: string; emoji: string }[] = [
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "facebook", label: "Facebook", emoji: "👤" },
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatCountdown(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff < 0) return "Passé";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `Dans ${days} j`;
  if (hours > 0) return `Dans ${hours}h`;
  return "Bientôt";
}

type Props = {
  posts: PostProgramme[];
  chantierPosts: ChantierPost[];
  notifActive?: boolean;
};

export function PlanningCalendar({ posts: initialPosts, chantierPosts, notifActive }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [posts, setPosts] = useState<PostProgramme[]>(initialPosts);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ChantierPost | null>(null);
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("09:00");
  const [reseau, setReseau] = useState<ReseauSocial>("instagram");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const prevMonth = useCallback(() => {
    setMonth((m) => { if (m === 0) { setYear((y) => y - 1); return 11; } return m - 1; });
    setSelectedDay(null);
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((m) => { if (m === 11) { setYear((y) => y + 1); return 0; } return m - 1 + 2; });
    setSelectedDay(null);
  }, []);

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const totalCells = startDow + lastDay.getDate();
  const weeks = Math.ceil(totalCells / 7);

  const postsByDate = new Map<string, PostProgramme[]>();
  for (const p of posts) {
    if (p.statut === "annule") continue;
    const key = parseLocalDate(p.date_publication).toISOString().slice(0, 10);
    if (!postsByDate.has(key)) postsByDate.set(key, []);
    postsByDate.get(key)!.push(p);
  }

  const selectedKey = selectedDay ? dateKey(selectedDay) : null;
  const selectedPosts = selectedKey ? (postsByDate.get(selectedKey) ?? []) : [];

  const upcomingPosts = posts
    .filter((p) => p.statut === "programme" && new Date(p.date_publication) >= today)
    .sort((a, b) => new Date(a.date_publication).getTime() - new Date(b.date_publication).getTime());

  // Créneaux recommandés selon réseau + date choisie
  const dateForCreneaux = dateInput ? parseLocalDate(dateInput) : (selectedDay ?? today);
  const creneaux = getCreneauxRecommandes(reseau, dateForCreneaux);

  async function handleSavePost() {
    if (!selectedPost || !dateInput || !timeInput) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const datePublication = `${dateInput}T${timeInput}:00`;
      const { data, error } = await supabase
        .from("posts_programmes")
        .insert({
          chantier_id: selectedPost.chantier_id,
          texte_post: selectedPost.texte_post,
          hashtags: selectedPost.hashtags,
          image_url: selectedPost.image_url,
          date_publication: datePublication,
          statut: "programme",
          reseau_social: reseau,
        })
        .select("id, chantier_id, texte_post, hashtags, image_url, date_publication, statut, reseau_social")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Erreur");
      setPosts((prev) => [
        ...prev,
        { ...data, statut: data.statut as "programme", chantier_titre: selectedPost.chantier_titre, reseau_social: (data.reseau_social as ReseauSocial) ?? "instagram" },
      ]);
      setShowModal(false);
      setSelectedPost(null);
      setDateInput("");
      setTimeInput("09:00");
      setReseau("instagram");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(postId: string) {
    setCancelling(postId);
    try {
      const supabase = createClient();
      await supabase.from("posts_programmes").update({ statut: "annule" }).eq("id", postId);
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, statut: "annule" } : p));
    } finally {
      setCancelling(null);
    }
  }

  function openModal(day: Date) {
    setSelectedDay(day);
    setDateInput(dateKey(day));
    setShowModal(true);
  }

  return (
    <div>
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-dusk/8 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dusk/8">
          <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-dusk/50 hover:bg-dusk/8 transition-colors" aria-label="Mois précédent">
            <CaretLeft size={16} aria-hidden="true" />
          </button>
          <h2 className="font-display text-base font-semibold text-dusk">{MONTHS_FR[month]} {year}</h2>
          <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-dusk/50 hover:bg-dusk/8 transition-colors" aria-label="Mois suivant">
            <CaretRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-dusk/8">
          {DAYS_FR.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-dusk/40 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: weeks * 7 }).map((_, i) => {
            const dayNum = i - startDow + 1;
            if (dayNum < 1 || dayNum > lastDay.getDate()) {
              return <div key={i} className="min-h-[72px] border-b border-r border-dusk/5 bg-dust/30" />;
            }
            const cellDate = new Date(year, month, dayNum);
            const key = dateKey(cellDate);
            const cellPosts = postsByDate.get(key) ?? [];
            const isToday = dateKey(today) === key;
            const isSelected = selectedKey === key;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : cellDate)}
                className={`min-h-[72px] p-2 border-b border-r border-dusk/5 text-left transition-colors duration-150 ${isSelected ? "bg-braise/8" : "hover:bg-dust/60"}`}
              >
                <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? "bg-braise text-white" : isSelected ? "bg-braise/20 text-braise" : "text-dusk"}`}>
                  {dayNum}
                </span>
                <div className="space-y-0.5">
                  {cellPosts.slice(0, 2).map((p) => {
                    const meta = RESEAU_META[(p.reseau_social ?? "instagram") as ReseauSocial];
                    return (
                      <div key={p.id} className="truncate text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: meta.bg, color: meta.color }}>
                        {new Date(p.date_publication).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {(p.texte_post ?? "").slice(0, 18)}…
                      </div>
                    );
                  })}
                  {cellPosts.length > 2 && <div className="text-[10px] text-dusk/40">+{cellPosts.length - 2}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-dusk/8 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dusk">
              {selectedDay.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <button
              type="button"
              onClick={() => openModal(selectedDay)}
              className="flex items-center gap-1.5 text-sm font-medium text-braise bg-braise/10 px-3 py-1.5 rounded-full hover:bg-braise/20 transition-colors"
            >
              <CalendarBlank size={14} aria-hidden="true" />
              Programmer un post
            </button>
          </div>
          {selectedPosts.length === 0 ? (
            <p className="text-sm text-dusk/40">Aucun post programmé ce jour.</p>
          ) : (
            <div className="space-y-3">
              {selectedPosts.map((p) => (
                <PostCard key={p.id} post={p} onCancel={handleCancel} cancelling={cancelling === p.id} notifActive={notifActive} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h2 className="font-display text-lg font-bold text-dusk mb-4">Posts à venir</h2>
        {upcomingPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dusk/8 py-12 px-6 text-center">
            <CalendarBlank size={32} className="text-dusk/20 mx-auto mb-3" aria-hidden="true" />
            <p className="text-dusk/50 text-sm">Aucun post programmé. Cliquez sur un jour du calendrier pour en programmer un.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingPosts.map((p) => (
              <PostCard key={p.id} post={p} onCancel={handleCancel} cancelling={cancelling === p.id} notifActive={notifActive} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dusk/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-dusk">Programmer un post</h3>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-dusk/50 hover:bg-dusk/8" aria-label="Fermer">
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Réseau social */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dusk/70 mb-2">Réseau social</label>
              <div className="flex gap-2">
                {RESEAUX.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReseau(r.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${reseau === r.value ? "border-braise/40 bg-braise/8 text-dusk" : "border-dusk/12 text-dusk/60 hover:bg-dust/60"}`}
                  >
                    <span>{r.emoji}</span>
                    <span className="hidden sm:inline">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Post selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dusk/70 mb-2">Choisir un post</label>
              {chantierPosts.length === 0 ? (
                <p className="text-sm text-dusk/40">Aucun post disponible. Générez d&apos;abord des posts depuis vos chantiers.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {chantierPosts.map((cp) => (
                    <button
                      key={cp.post_id}
                      type="button"
                      onClick={() => setSelectedPost(cp)}
                      className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${selectedPost?.post_id === cp.post_id ? "border-braise/40 bg-braise/8 text-dusk" : "border-dusk/12 hover:bg-dust/60 text-dusk/80"}`}
                    >
                      <p className="font-medium truncate">{cp.chantier_titre}</p>
                      <p className="text-dusk/50 text-xs truncate mt-0.5">{cp.texte_post.slice(0, 80)}…</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date / Heure */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="prog-date" className="block text-xs font-medium text-dusk/60 mb-1">Date</label>
                <input id="prog-date" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} min={dateKey(today)} className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-braise/30" />
              </div>
              <div>
                <label htmlFor="prog-time" className="block text-xs font-medium text-dusk/60 mb-1">Heure</label>
                <input id="prog-time" type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm focus:outline-none focus:ring-2 focus:ring-braise/30" />
              </div>
            </div>

            {/* Créneaux recommandés */}
            <div className="mb-5">
              <p className="text-xs font-medium text-dusk/60 mb-2">Créneaux recommandés ({RESEAU_META[reseau].label})</p>
              <div className="flex flex-wrap gap-2">
                {creneaux.map((c) => (
                  <button
                    key={c.heure}
                    type="button"
                    onClick={() => setTimeInput(c.heure)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${timeInput === c.heure ? "bg-braise text-white border-braise" : "border-dusk/15 text-dusk/70 hover:bg-dust/60"}`}
                  >
                    {c.meilleur && <Star size={10} weight="fill" className={timeInput === c.heure ? "text-white/80" : "text-ambre"} aria-hidden="true" />}
                    {c.label}
                    {c.meilleur && <span className={`text-[10px] ${timeInput === c.heure ? "text-white/70" : "text-ambre"}`}>Meilleur</span>}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePost}
              disabled={!selectedPost || !dateInput || saving}
              className="w-full flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-ambre disabled:opacity-50 transition-all duration-200"
            >
              <Clock size={15} aria-hidden="true" />
              {saving ? "Enregistrement…" : "Programmer ce post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReseauIcon({ reseau }: { reseau: ReseauSocial }) {
  const meta = RESEAU_META[reseau];
  const emojis: Record<ReseauSocial, string> = { instagram: "📸", facebook: "👤", tiktok: "🎵" };
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm shrink-0"
      style={{ background: meta.bg, color: meta.color }}
      title={meta.label}
    >
      {emojis[reseau]}
    </span>
  );
}

function StatusBadge({ statut }: { statut: PostProgramme["statut"] }) {
  if (statut === "publie") return <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Publié</span>;
  if (statut === "annule") return <span className="text-[10px] font-semibold text-dusk/40 bg-dusk/8 px-2 py-0.5 rounded-full">Annulé</span>;
  return <span className="text-[10px] font-semibold text-ambre bg-ambre/15 px-2 py-0.5 rounded-full">Programmé</span>;
}

function PostCard({
  post,
  onCancel,
  cancelling,
  notifActive,
}: {
  post: PostProgramme;
  onCancel: (id: string) => void;
  cancelling: boolean;
  notifActive?: boolean;
}) {
  const date = new Date(post.date_publication);
  const reseau = (post.reseau_social ?? "instagram") as ReseauSocial;
  const countdown = post.statut === "programme" ? formatCountdown(date) : null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-dusk/8 bg-dust/30">
      <ReseauIcon reseau={reseau} />

      {post.image_url && (
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
          <Image src={post.image_url} alt="" fill unoptimized className="object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {post.chantier_titre && (
          <p className="text-[10px] font-semibold text-dusk/40 uppercase tracking-wider mb-0.5">{post.chantier_titre}</p>
        )}
        <p className="text-sm text-dusk leading-snug line-clamp-2">
          {(post.texte_post ?? "").slice(0, 50)}{(post.texte_post ?? "").length > 50 ? "…" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <StatusBadge statut={post.statut} />
          {countdown && (
            <span className="text-[10px] font-medium text-dusk/50">{countdown}</span>
          )}
          {notifActive && post.statut === "programme" && (
            <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">🔔 Notif active</span>
          )}
        </div>
        {post.hashtags.length > 0 && (
          <p className="text-xs text-ambre mt-1 truncate">{post.hashtags.slice(0, 4).join(" ")}</p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-dusk/70">
          {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
        <p className="text-xs text-dusk/40">
          {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        {post.statut === "programme" && (
          <button
            type="button"
            onClick={() => onCancel(post.id)}
            disabled={cancelling}
            className="mt-2 flex items-center gap-1 text-xs text-dusk/35 hover:text-red-500 transition-colors"
            aria-label="Annuler ce post"
          >
            <Trash size={12} aria-hidden="true" />
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
