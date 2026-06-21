"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const shouldReduce = useReducedMotion();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }
    setError("");
    setSent(true);
  }

  return (
    <section className="relative bg-dusk py-24 lg:py-32 overflow-hidden" id="liste-attente">
      <div
        className="lumiere-fin-chantier absolute top-0 left-0 right-0 h-48 lg:h-64 opacity-90"
        style={{ maskImage: "linear-gradient(to bottom, black, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black, transparent)" }}
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">

          <motion.h2
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] as [number, number, number, number] }}
            className="font-display text-4xl lg:text-5xl font-bold text-dust leading-tight mb-5"
          >
            Rejoignez les premiers artisans à communiquer sans effort.
          </motion.h2>

          <motion.p
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-dust/75 text-lg leading-relaxed mb-10"
          >
            La liste d'attente est ouverte. On vous contacte personnellement
            dès l'ouverture, avec un tarif réservé aux premiers inscrits.
          </motion.p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex items-start gap-4 bg-dust/15 rounded-2xl px-6 py-5"
              role="status"
              aria-live="polite"
            >
              <CheckCircle weight="fill" size={24} className="text-dust shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-dust font-semibold mb-0.5">Vous êtes sur la liste.</p>
                <p className="text-dust/70 text-sm">
                  On vous écrira à <strong className="text-dust">{email}</strong> dès l'ouverture.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              onSubmit={handleSubmit}
              aria-label="Formulaire d'inscription à la liste d'attente"
              noValidate
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="waitlist-email" className="sr-only">
                    Adresse email professionnelle
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="votre@email.fr"
                    required
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "email-error" : undefined}
                    className="w-full bg-dust text-dusk placeholder:text-dusk/40 font-medium text-base px-5 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-dusk/30 transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-braise text-white font-semibold text-[1.0625rem] px-7 py-4 rounded-full hover:bg-ambre active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
                >
                  Je réserve ma place
                  <ArrowRight weight="bold" size={18} aria-hidden="true" />
                </button>
              </div>

              {error && (
                <p id="email-error" role="alert" className="text-dust/90 text-sm mt-3 ml-1">
                  {error}
                </p>
              )}

              <p className="text-dust/50 text-xs mt-4 ml-1">
                Aucune carte requise. Pas de spam. Désinscription en un clic.
              </p>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
