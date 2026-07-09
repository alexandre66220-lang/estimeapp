import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const BASE = "https://estime-app.com";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "default";
  const titre = searchParams.get("titre") ?? "";
  const categorie = searchParams.get("categorie") ?? "";
  const metier = searchParams.get("metier") ?? "";
  const ville = searchParams.get("ville") ?? "";

  // Blog article
  if (type === "blog") {
    const badgeColor =
      categorie === "Technique" ? "#2D6A8F" :
      categorie === "Marketing" ? "#2D7A4F" :
      categorie === "Gestion" ? "#6B4F9E" :
      categorie === "Sécurité" ? "#B03A2E" :
      "#C75D3B";

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            background: "#C75D3B",
            padding: "64px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.5px" }}>
              Estime
            </span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginLeft: 12 }}>
              · Blog artisans BTP
            </span>
          </div>

          {/* Titre */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 40 }}>
            <span
              style={{
                fontSize: titre.length > 60 ? 42 : 52,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.15,
                maxWidth: 900,
              }}
            >
              {titre || "Conseils pour artisans BTP"}
            </span>
          </div>

          {/* Badge catégorie */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {categorie && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#ffffff",
                  background: badgeColor,
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                {categorie}
              </span>
            )}
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              estime-app.com/blog
            </span>
          </div>

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 300,
              height: 630,
              background: "linear-gradient(to left, rgba(0,0,0,0.2), transparent)",
            }}
          />
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Artisans metier/ville
  if (type === "artisans") {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            background: "#2B2521",
            padding: "64px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: "rgba(248,245,242,0.9)", letterSpacing: "-0.5px" }}>
              Estime
            </span>
            <span style={{ fontSize: 14, color: "rgba(248,245,242,0.4)", marginLeft: 12 }}>
              · Annuaire artisans BTP
            </span>
          </div>

          {/* Titre principal */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
            <span style={{ fontSize: 56, fontWeight: 700, color: "#ffffff", lineHeight: 1.1 }}>
              {metier && ville ? `${metier} à ${ville}` : metier || ville || "Artisans BTP certifiés"}
            </span>
            <span style={{ fontSize: 22, color: "rgba(248,245,242,0.5)", marginTop: 12 }}>
              Artisans certifiés Estime, score de réputation vérifié
            </span>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#ffffff",
                background: "#C75D3B",
                padding: "8px 20px",
                borderRadius: 999,
              }}
            >
              Voir les artisans
            </span>
            <span style={{ fontSize: 14, color: "rgba(248,245,242,0.4)" }}>
              estime-app.com/artisans
            </span>
          </div>

          {/* Accent */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "#C75D3B",
            }}
          />
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Default OG
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1410",
          fontFamily: "sans-serif",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 48, fontWeight: 700, color: "#F8F5F2", letterSpacing: "-1px" }}>
          Estime
        </span>
        <span style={{ fontSize: 22, color: "rgba(248,245,242,0.5)", textAlign: "center", maxWidth: 600 }}>
          L&apos;app de réputation pour les artisans BTP
        </span>
        <div style={{ width: 60, height: 3, background: "#C75D3B", borderRadius: 999, marginTop: 8 }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
