import Link from "next/link";
import { ArrowSquareOut, QrCode } from "@phosphor-icons/react/dist/ssr";
import QRCode from "qrcode";
import { CopyLinkButton } from "./CopyLinkButton";

type Props = {
  slug: string;
};

export async function VitrineSection({ slug }: Props) {
  const url = `https://estime-app.com/artisan/${slug}`;

  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    color: { dark: "#2B2521", light: "#F8F5F2" },
  });

  // On injecte le SVG inline pour l'aperçu + on crée un data URI pour le téléchargement
  const qrDataUri = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString("base64")}`;

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <QrCode size={20} className="text-braise" weight="duotone" aria-hidden="true" />
        <h2 className="font-display text-lg font-bold text-dusk">Ma page vitrine</h2>
      </div>
      <p className="text-dusk/50 text-sm mb-5">
        Partagez cette page à vos prospects et clients pour qu&apos;ils puissent voir vos
        réalisations et vous contacter.
      </p>

      {/* URL */}
      <div className="flex items-center gap-2 mb-5 p-3 bg-dust rounded-xl overflow-hidden">
        <span className="flex-1 text-sm text-dusk/70 truncate font-mono">{url}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-7">
        <CopyLinkButton url={url} />
        <Link
          href={`/artisan/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-4 py-2 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200"
        >
          <ArrowSquareOut size={15} aria-hidden="true" />
          Voir ma page vitrine
        </Link>
      </div>

      {/* QR code */}
      <div>
        <p className="text-sm font-medium text-dusk/70 mb-3">QR code</p>
        <div className="flex items-start gap-4">
          <div
            className="w-28 h-28 rounded-xl overflow-hidden border border-dusk/10 bg-[#F8F5F2] flex items-center justify-center"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: qrSvg }}
            aria-label={`QR code vers ${url}`}
          />
          <a
            href={qrDataUri}
            download={`qr-vitrine-${slug}.svg`}
            className="inline-flex items-center gap-2 text-dusk font-medium text-sm px-4 py-2 rounded-full border border-dusk/20 hover:bg-dusk/5 active:scale-[0.97] transition-all duration-200 self-start"
          >
            Télécharger le QR code
          </a>
        </div>
      </div>
    </div>
  );
}
