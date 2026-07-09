"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import {
  animationClass,
  animationDurationMs,
  animationAmplitude,
  type AnimEffet,
  type AnimIntensite,
} from "@/lib/vitrine/defaults";

export function ScrollReveal({
  children,
  effet,
  intensite,
  className = "",
  style,
}: {
  children: ReactNode;
  effet: AnimEffet;
  intensite: AnimIntensite;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (effet === "aucun") return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("vitrine-anim-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [effet]);

  if (effet === "aucun") {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const { amp, scale } = animationAmplitude(intensite);
  const cls = animationClass(effet);

  return (
    <div
      ref={ref}
      className={`${cls} ${className}`}
      style={{
        ["--vitrine-anim-duree" as string]: `${animationDurationMs(intensite)}ms`,
        ["--vitrine-anim-amp" as string]: amp,
        ["--vitrine-anim-scale" as string]: scale,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
