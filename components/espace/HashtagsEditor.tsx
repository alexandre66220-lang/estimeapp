"use client";

import { useState } from "react";
import { X, Plus, ClipboardText, Check } from "@phosphor-icons/react";

function normalizeHashtag(value: string) {
  const trimmed = value.trim().replace(/^#/, "");
  if (!trimmed) return null;
  return `#${trimmed.toLowerCase().replace(/\s+/g, "")}`;
}

export function HashtagsEditor({
  hashtags,
  onChange,
}: {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
}) {
  const [nouveauTag, setNouveauTag] = useState("");
  const [copied, setCopied] = useState(false);

  function handleRemove(tag: string) {
    onChange(hashtags.filter((t) => t !== tag));
  }

  function handleAdd() {
    const normalized = normalizeHashtag(nouveauTag);
    if (!normalized || hashtags.includes(normalized)) {
      setNouveauTag("");
      return;
    }
    onChange([...hashtags, normalized]);
    setNouveauTag("");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <h2 className="font-display text-sm font-bold text-dusk mb-3">Hashtags</h2>

      <div className="flex flex-wrap gap-2 mb-3">
        {hashtags.length === 0 && (
          <p className="text-dusk/45 text-sm">Aucun hashtag pour l&apos;instant.</p>
        )}
        {hashtags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleRemove(tag)}
            className="group inline-flex items-center gap-1.5 bg-braise/10 text-dusk text-sm font-medium px-3 py-1.5 rounded-full hover:bg-braise/20 transition-colors duration-200"
          >
            {tag}
            <X
              size={13}
              weight="bold"
              className="text-dusk/50 group-hover:text-dusk transition-colors duration-200"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={nouveauTag}
          onChange={(event) => setNouveauTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Ajouter un hashtag"
          className="flex-1 min-w-[140px] px-3.5 py-2 rounded-full border border-dusk/15 bg-dust text-dusk text-sm placeholder:text-dusk/30 focus:outline-none focus:ring-2 focus:ring-ambre/30 focus:border-ambre/50 transition-all duration-200"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-dusk font-medium text-sm px-4 py-2 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={14} weight="bold" aria-hidden="true" />
          Ajouter
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={hashtags.length === 0}
        className="inline-flex items-center justify-center gap-2 text-dusk font-medium text-sm px-5 py-2.5 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
      >
        {copied ? (
          <Check size={16} weight="bold" aria-hidden="true" />
        ) : (
          <ClipboardText size={16} weight="bold" aria-hidden="true" />
        )}
        {copied ? "Copié !" : "Copier les hashtags"}
      </button>
    </div>
  );
}
