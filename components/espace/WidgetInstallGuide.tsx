"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

const STEP_CLASS = "flex items-start gap-4 p-4 rounded-2xl bg-dust/60 border border-dusk/6";
const NUM_CLASS = "w-8 h-8 rounded-full bg-[#C75D3B] text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5";

function scriptableScript(userId: string) {
  return `// Widget Estime pour Scriptable
// Installez Scriptable (gratuit) depuis l'App Store puis collez ce script

const WIDGET_URL = "https://estime-app.com/widget/${userId}"

const req = new Request(WIDGET_URL)
const html = await req.loadString()

// Extraire les valeurs via regex
function extract(label) {
  const re = new RegExp(label + '[^<]*<\\/div>[^<]*<div[^>]*>([0-9]+)')
  const m = html.match(re)
  return m ? m[1] : "0"
}

const scoreMatch = html.match(/<span class="score-num">([0-9]+)<\\/span>/)
const score = scoreMatch ? scoreMatch[1] : "0"

const w = new ListWidget()
w.backgroundColor = new Color("#2B2521")
w.setPadding(14, 16, 14, 16)

const title = w.addText("Estime")
title.textColor = new Color("#C75D3B")
title.font = Font.boldSystemFont(13)

w.addSpacer()

const scoreText = w.addText(score + " /100")
scoreText.textColor = Color.white()
scoreText.font = Font.boldSystemFont(36)

w.addSpacer()

Script.setWidget(w)
Script.complete()
`;
}

export function WidgetInstallGuide({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const script = scriptableScript(userId);

  async function copy() {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-white rounded-2xl border border-dusk/8 p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📱</span>
        <h2 className="font-display text-lg font-bold text-dusk">Widget iOS</h2>
      </div>
      <p className="text-dusk/55 text-sm mb-5">
        Affichez votre score de réputation Estime directement sur votre écran d&apos;accueil iPhone via l&apos;app <strong>Scriptable</strong>.
      </p>

      <div className="space-y-3 mb-5">
        <div className={STEP_CLASS}>
          <div className={NUM_CLASS}>1</div>
          <div>
            <p className="font-semibold text-dusk text-sm">Installez Scriptable</p>
            <p className="text-dusk/55 text-sm mt-0.5">
              Téléchargez <strong>Scriptable</strong> gratuitement depuis l&apos;App Store (recherchez &laquo;&nbsp;Scriptable&nbsp;&raquo;).
            </p>
          </div>
          <span className="text-3xl ml-auto">🛠️</span>
        </div>

        <div className={STEP_CLASS}>
          <div className={NUM_CLASS}>2</div>
          <div>
            <p className="font-semibold text-dusk text-sm">Copiez le script ci-dessous</p>
            <p className="text-dusk/55 text-sm mt-0.5">
              Appuyez sur &laquo;&nbsp;Copier le script&nbsp;&raquo;, ouvrez Scriptable, créez un nouveau script et collez le contenu.
            </p>
          </div>
          <span className="text-3xl ml-auto">📋</span>
        </div>

        <div className={STEP_CLASS}>
          <div className={NUM_CLASS}>3</div>
          <div>
            <p className="font-semibold text-dusk text-sm">Ajoutez le widget</p>
            <p className="text-dusk/55 text-sm mt-0.5">
              Sur votre écran d&apos;accueil, maintenez appuyé → + → Scriptable → choisissez votre script Estime.
            </p>
          </div>
          <span className="text-3xl ml-auto">✨</span>
        </div>
      </div>

      {/* Script block */}
      <div className="relative rounded-xl bg-[#1C1A17] border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
          <span className="text-xs text-white/40 font-mono">widget-estime.js</span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
            {copied ? "Copié !" : "Copier le script"}
          </button>
        </div>
        <pre className="text-xs text-white/60 px-4 py-3 overflow-x-auto leading-relaxed max-h-40 font-mono">
          {script}
        </pre>
      </div>

      <p className="text-dusk/35 text-xs mt-3 text-center">
        Ce script est lié à votre compte, ne le partagez pas.
      </p>
    </div>
  );
}
