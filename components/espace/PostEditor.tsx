"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  ArrowsClockwise,
  Smiley,
  Hash,
  Plus,
  X,
  ShareNetwork,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

const BTP_EMOJIS = [
  "🏠", "🔨", "🎨", "🪣", "✅", "⭐", "🔧", "🏗️", "💪", "👷",
  "🌟", "💼", "📸", "🤝", "🔑", "🏡", "🛠️", "💧", "⚡", "🌿",
];

function CharCounter({ count }: { count: number }) {
  const color =
    count >= 2200
      ? "text-red-500"
      : count >= 1800
      ? "text-orange-500"
      : "text-dusk/40";
  return <span className={`text-xs font-mono ${color}`}>{count} / 2200</span>;
}

function CopyButton({ text, label, icon }: { text: string; label: string; icon?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-dusk/15 text-dusk/60 hover:bg-dust/60 transition-colors"
    >
      {copied ? <Check size={12} weight="bold" className="text-green-600" /> : (icon ?? <Copy size={12} />)}
      {copied ? "Copié !" : label}
    </button>
  );
}

type PostEditorProps = {
  chantierId: string;
  initialCaption: string;
  initialHashtags: string[];
  imageUrl: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function PostEditor({
  chantierId,
  initialCaption,
  initialHashtags,
  imageUrl,
  onRegenerate,
  isRegenerating,
}: PostEditorProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [newTag, setNewTag] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveToDb = useCallback(
    async (text: string) => {
      setSaving(true);
      const supabase = createClient();
      await supabase
        .from("chantiers")
        .update({ post_modifie: text })
        .eq("id", chantierId);
      setSaving(false);
    },
    [chantierId]
  );

  function handleCaptionChange(val: string) {
    setCaption(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToDb(val), 1500);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el) {
      setCaption((c) => c + emoji);
      return;
    }
    const start = el.selectionStart ?? caption.length;
    const end = el.selectionEnd ?? caption.length;
    const next = caption.slice(0, start) + emoji + caption.slice(end);
    setCaption(next);
    handleCaptionChange(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
    setShowEmoji(false);
  }

  function addHashtag() {
    const tag = newTag.trim().replace(/^#/, "");
    if (!tag) return;
    const formatted = `#${tag}`;
    if (!hashtags.includes(formatted)) {
      setHashtags([...hashtags, formatted]);
    }
    setNewTag("");
  }

  function removeHashtag(tag: string) {
    setHashtags(hashtags.filter((t) => t !== tag));
  }

  const fullText = `${caption}\n\n${hashtags.join(" ")}`;

  function handleShare(platform: "instagram" | "facebook") {
    const text = encodeURIComponent(fullText);
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, "_blank");
    } else {
      navigator.clipboard.writeText(fullText);
      alert("Texte copié ! Ouvrez Instagram et collez dans votre publication.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dust-dark">
        <Image
          src={imageUrl}
          alt="Photo du chantier"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
        />
      </div>

      {/* Caption editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="post-caption" className="text-sm font-medium text-dusk/70">
            Légende
          </label>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-dusk/30">Sauvegarde…</span>}
            <CharCounter count={caption.length} />
          </div>
        </div>
        <div className="relative">
          <textarea
            id="post-caption"
            ref={textareaRef}
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            rows={7}
            className="w-full px-4 py-3 rounded-xl border border-dusk/15 bg-dust text-dusk text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200 resize-none"
          />
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="absolute bottom-3 right-3 text-dusk/30 hover:text-dusk/60 transition-colors"
            title="Emojis BTP"
          >
            <Smiley size={18} />
          </button>
        </div>

        {/* Emoji picker */}
        {showEmoji && (
          <div className="mt-2 p-3 bg-white border border-dusk/10 rounded-xl shadow-sm grid grid-cols-10 gap-1">
            {BTP_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => insertEmoji(e)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <CopyButton text={caption} label="Copier la légende" />
          <CopyButton text={hashtags.join(" ")} label="Copier les hashtags" icon={<Hash size={12} />} />
          <CopyButton text={fullText} label="Tout copier" />
          <button
            type="button"
            onClick={() => handleCaptionChange(initialCaption)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-dusk/15 text-dusk/60 hover:bg-dust/60 transition-colors"
            title="Réinitialiser la légende"
          >
            <ArrowsClockwise size={12} />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Hash size={14} className="text-dusk/40" />
          <span className="text-sm font-medium text-dusk/70">Hashtags</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-braise/10 text-braise text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="hover:text-braise/60 transition-colors"
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
            placeholder="Ajouter un hashtag"
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-dusk/15 bg-dust text-dusk placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
          />
          <button
            type="button"
            onClick={addHashtag}
            className="px-3 py-2 rounded-xl border border-dusk/15 text-dusk/60 hover:bg-dust/60 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-5 border-t border-dusk/8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
        >
          <ArrowsClockwise size={16} weight="bold" className={isRegenerating ? "animate-spin" : ""} />
          {isRegenerating ? "Génération…" : "Regénérer"}
        </button>
        <button
          type="button"
          onClick={() => handleShare("instagram")}
          className="inline-flex items-center justify-center gap-2 bg-braise text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200"
        >
          <ShareNetwork size={16} weight="bold" />
          Partager sur Instagram
        </button>
        <button
          type="button"
          onClick={() => handleShare("facebook")}
          className="inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-full active:scale-[0.97] transition-all duration-200"
          style={{ background: "#1877F2" }}
        >
          <ShareNetwork size={16} weight="bold" />
          Facebook
        </button>
      </div>
    </div>
  );
}
