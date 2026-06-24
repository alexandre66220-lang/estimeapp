import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Mentions légales - Estime",
  description: "Mentions légales du site Estime, édité par Alexandre Lenique.",
};

export default function MentionsLegales() {
  return (
    <LegalPageShell title="Mentions légales">
      <section>
        <h2 className="font-landing-display text-xl font-semibold text-dust mb-4">
          Éditeur du site
        </h2>
        <p className="font-landing-sans text-dust/70 text-base leading-relaxed">
          Le site Estime est édité par Alexandre Lenique, micro-entrepreneur
          (EI), domicilié 90 avenue Georges Guynemer, 81200 Mazamet, France.
          <br />
          SIRET : 10451654700015
          <br />
          Email :{" "}
          <a href="mailto:spark@alcalspark.com" className="text-ambre hover:underline">
            spark@alcalspark.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="font-landing-display text-xl font-semibold text-dust mb-4">
          Hébergement
        </h2>
        <p className="font-landing-sans text-dust/70 text-base leading-relaxed">
          Le site est hébergé par Netlify, Inc., 512 2nd Street, Suite 200,
          San Francisco, CA 94107, États-Unis.
        </p>
      </section>

      <section>
        <h2 className="font-landing-display text-xl font-semibold text-dust mb-4">
          Directeur de publication
        </h2>
        <p className="font-landing-sans text-dust/70 text-base leading-relaxed">
          Alexandre Lenique.
        </p>
      </section>
    </LegalPageShell>
  );
}
