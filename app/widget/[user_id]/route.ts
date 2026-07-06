import { createAdminClient } from "@/lib/supabase/admin";
import { computeReputationScore } from "@/lib/score/reputation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("prenom, nom")
    .eq("id", user_id)
    .maybeSingle();

  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: chantiersMois },
    { count: totalPosts },
    { count: totalAvis },
    scoreData,
  ] = await Promise.all([
    admin.from("chantiers").select("id", { count: "exact", head: true }).eq("user_id", user_id).gte("created_at", startOfMonth),
    admin.from("chantiers").select("id", { count: "exact", head: true }).eq("user_id", user_id).not("post_genere", "is", null),
    admin.from("emails_avis").select("id", { count: "exact", head: true }).eq("user_id", user_id),
    computeReputationScore(admin as Parameters<typeof computeReputationScore>[0], user_id),
  ]);

  const score = scoreData?.total ?? 0;
  const pct = Math.min(100, Math.round(score));
  const name = [profile.prenom, profile.nom].filter(Boolean).join(" ") || "Artisan";

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=320"/>
<title>Widget Estime</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:320px;height:150px;overflow:hidden;background:#2B2521;font-family:-apple-system,sans-serif;color:#F8F5F2}
.c{padding:14px 16px;height:150px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;justify-content:space-between}
.logo{font-size:13px;font-weight:700;letter-spacing:-.3px;color:#C75D3B}
.name{font-size:11px;color:rgba(248,245,242,.5)}
.sr{display:flex;align-items:baseline;gap:4px}
.sn{font-size:42px;font-weight:800;line-height:1}
.sm{font-size:16px;color:rgba(248,245,242,.45);font-weight:500}
.bb{height:4px;background:rgba(248,245,242,.12);border-radius:2px;margin-top:6px}
.bf{height:4px;background:#C75D3B;border-radius:2px}
.stats{display:flex}
.stat{flex:1}
.st-n{font-size:15px;font-weight:700}
.st-l{font-size:9px;color:rgba(248,245,242,.4);text-transform:uppercase;letter-spacing:.3px;margin-top:1px}
.dv{width:1px;background:rgba(248,245,242,.08);margin:0 8px}
</style>
</head>
<body>
<div class="c">
<div class="top"><span class="logo">Estime</span><span class="name">${name}</span></div>
<div><div class="sr"><span class="sn">${score}</span><span class="sm">/100</span></div><div class="bb"><div class="bf" style="width:${pct}%"></div></div></div>
<div class="stats">
<div class="stat"><div class="st-n">${chantiersMois ?? 0}</div><div class="st-l">ce mois</div></div>
<div class="dv"></div>
<div class="stat"><div class="st-n">${totalPosts ?? 0}</div><div class="st-l">posts</div></div>
<div class="dv"></div>
<div class="stat"><div class="st-n">${totalAvis ?? 0}</div><div class="st-l">avis</div></div>
</div>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
