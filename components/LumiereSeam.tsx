"use client";

import { useEffect, useRef, useState } from "react";

export function LumiereSeam({ className = "h-1" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`lumiere-fin-chantier origin-center transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:!opacity-100 motion-reduce:!scale-x-100 ${
        visible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-[0.7]"
      } ${className}`}
      aria-hidden="true"
    />
  );
}
