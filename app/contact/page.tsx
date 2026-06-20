import type { Metadata } from "next";
import { EnvelopeSimple, Clock, ChatCircle } from "@phosphor-icons/react/dist/ssr";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact - Estime",
  description: "Contactez l'équipe Estime pour toute question sur le service.",
};

export default function Contact() {
  return (
    <PageShell
      title="Nous contacter"
      subtitle="Une question, une suggestion ? On vous répond sous 48h ouvrées."
    >
      <div className="space-y-8">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: EnvelopeSimple,
              label: "Email",
              value: "contact@alcalspark.com",
            },
            {
              icon: Clock,
              label: "Délai de réponse",
              value: "48h ouvrées",
            },
            {
              icon: ChatCircle,
              label: "Langue",
              value: "Français",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 border border-charbon/8 flex items-start gap-4"
            >
              <div className="w-9 h-9 bg-terracotta/10 rounded-full flex items-center justify-center shrink-0">
                <Icon size={18} className="text-terracotta" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-charbon/45 font-medium mb-0.5">{label}</p>
                <p className="text-sm text-charbon font-semibold break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-10 border border-charbon/8">
          <h2 className="font-display text-2xl font-bold text-charbon mb-2">
            Écrire un message
          </h2>
          <p className="text-charbon/50 text-sm mb-8">
            Ce formulaire ouvre votre application email avec les informations pré-remplies.
          </p>

          <form
            action="mailto:contact@alcalspark.com"
            method="post"
            encType="text/plain"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charbon/70 mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="Nom"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-charbon/15 bg-creme text-charbon text-sm placeholder:text-charbon/30 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/50 transition-all duration-200"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charbon/70 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="Email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-charbon/15 bg-creme text-charbon text-sm placeholder:text-charbon/30 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/50 transition-all duration-200"
                  placeholder="jean@exemple.fr"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-charbon/70 mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="Message"
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl border border-charbon/15 bg-creme text-charbon text-sm placeholder:text-charbon/30 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta/50 transition-all duration-200 resize-none"
                placeholder="Votre question ou message..."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-terracotta-dark text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-terracotta active:scale-[0.97] transition-all duration-200"
              >
                Envoyer le message
              </button>
              <span className="text-charbon/40 text-xs">
                ou directement via{" "}
                <a
                  href="mailto:contact@alcalspark.com"
                  className="text-terracotta hover:underline"
                >
                  contact@alcalspark.com
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
