"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimateInProps) {
  const shouldReduce = useReducedMotion();

  const initial =
    shouldReduce || direction === "none"
      ? { opacity: 0 }
      : direction === "left"
        ? { opacity: 0, x: 32 }
        : { opacity: 0, y: 28 };

  return (
    <m.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      {children}
    </m.div>
  );
}
