"use client";

import { motion, useReducedMotion } from "motion/react";

export function LumiereSeam({ className = "h-1" }: { className?: string }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={`lumiere-fin-chantier ${className}`}
      style={{ transformOrigin: "center" }}
      initial={shouldReduce ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.7 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    />
  );
}
