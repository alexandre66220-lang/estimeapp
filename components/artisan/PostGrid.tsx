"use client";

import { useState } from "react";
import Image from "next/image";
import { InstagramLogo } from "@phosphor-icons/react";

type Post = {
  id: string;
  contenu: string;
  image_url: string | null;
};

export function PostGrid({ posts }: { posts: Post[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setActiveId((prev) => (prev === id ? null : id));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {posts.map((p) => {
        const isActive = activeId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className="relative aspect-square rounded-xl overflow-hidden bg-[#E8E0D2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C75D3B]"
            aria-label={isActive ? "Masquer le texte du post" : "Voir le texte du post"}
          >
            {p.image_url ? (
              <Image
                src={p.image_url}
                alt="Post Instagram"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <InstagramLogo size={32} className="text-[#2B2521]/15" />
              </div>
            )}
            {/* Overlay */}
            <div
              className={`absolute inset-0 bg-[#2B2521]/80 flex items-center justify-center p-3 transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <p className="text-white text-xs leading-relaxed line-clamp-6 text-center">
                {p.contenu}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
