"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";

export default function Hero() {
  const shouldReduce = useReducedMotion();

  function fadeUp(delay: number) {
    return {
      initial: shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    };
  }

  return (
    <section className="bg-creme min-h-[100dvh] flex items-center pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

          {/* Texte */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="text-xs font-semibold tracking-[0.18em] uppercase text-terracotta mb-6"
            >
              Pour peintres, plombiers, maçons et électriciens
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-display text-5xl lg:text-[3.75rem] font-bold text-charbon leading-[1.1] mb-6"
            >
              Finissez le chantier.
              <br />
              <em className="not-italic text-terracotta">L'IA fait le reste.</em>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="text-lg text-charbon/65 leading-relaxed mb-10 max-w-[48ch]"
            >
              Photo avant/après + IA = post réseaux prêt en 30 secondes.
              Relance automatique pour vos avis Google et recommandations.
            </motion.p>

            <motion.div
              {...fadeUp(0.3)}
              className="flex flex-col sm:flex-row gap-4 items-start"
            >
              <a
                href="#liste-attente"
                className="inline-flex items-center gap-2.5 bg-terracotta-dark text-white font-semibold text-[1.0625rem] px-7 py-4 rounded-full hover:bg-terracotta active:scale-[0.98] transition-all duration-200"
              >
                Rejoindre la liste d'attente
                <ArrowRight weight="bold" size={18} aria-hidden="true" />
              </a>
              <a
                href="#comment-ca-marche"
                className="inline-flex items-center gap-2 text-charbon font-medium text-[1.0625rem] px-7 py-4 rounded-full border border-charbon/20 hover:bg-charbon/5 active:scale-[0.98] transition-all duration-200"
              >
                Comment ça marche
              </a>
            </motion.div>

            <motion.div
              {...fadeUp(0.4)}
              className="flex items-center gap-6 mt-10"
            >
              {["Sans engagement", "24,99€/mois", "Support humain"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-charbon/55">
                  <CheckCircle weight="fill" size={16} className="text-terracotta shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visuel */}
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative"
          >
            {/* Forme de fond */}
            <div
              className="absolute -top-12 -right-12 w-72 h-72 bg-terracotta/10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Photo principale */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-charbon/15 aspect-[4/3]">
              <Image
                src="https://picsum.photos/seed/artisan-peintre-chantier/800/600"
                alt="Artisan peintre sur un chantier avant/après renovation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Overlay sombre pour lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-charbon/30 to-transparent" />
            </div>

            {/* Carte flottante */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-xl shadow-charbon/12 border border-creme-dark max-w-[220px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-terracotta/10 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle weight="fill" size={20} className="text-terracotta" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-charbon text-sm leading-tight">Post Instagram prêt</p>
                  <p className="text-charbon/50 text-xs mt-0.5">Généré en 28 secondes</p>
                </div>
              </div>
            </div>

            {/* Badge avis */}
            <div className="absolute -top-3 -right-3 bg-terracotta text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-terracotta/30">
              +12 avis ce mois
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
