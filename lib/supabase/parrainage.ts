import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugifyBase(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

function randomSuffix() {
  return Math.floor(10 + Math.random() * 90).toString();
}

export async function generateUniqueCodeParrainage(
  supabase: SupabaseClient,
  seed: string
): Promise<string> {
  const base = slugifyBase(seed) || "ARTISAN";

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `ESTIME-${base}${randomSuffix()}`;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("code_parrainage", code)
      .maybeSingle();

    if (!data) return code;
  }

  return `ESTIME-${base}${Date.now().toString().slice(-6)}`;
}

export type ParrainageEntry = {
  id: string;
  filleul_email: string | null;
  statut: "en_attente" | "converti";
  created_at: string;
  converti_at: string | null;
};

export type ParrainageStats = {
  code: string | null;
  totalFilleuls: number;
  moisGagnes: number;
  parrainages: ParrainageEntry[];
};

export async function getParrainageStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ParrainageStats> {
  const [{ data: profile }, { data: parrainages }] = await Promise.all([
    supabase.from("profiles").select("code_parrainage").eq("id", userId).maybeSingle(),
    supabase
      .from("parrainages")
      .select("id, filleul_email, statut, created_at, converti_at")
      .eq("parrain_id", userId)
      .not("filleul_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  const entries = parrainages ?? [];

  return {
    code: profile?.code_parrainage ?? null,
    totalFilleuls: entries.length,
    moisGagnes: entries.filter((entry) => entry.statut === "converti").length,
    parrainages: entries,
  };
}

export async function registerFilleulParrainage(
  supabase: SupabaseClient,
  code: string,
  filleulId: string,
  filleulEmail: string
): Promise<void> {
  const { data: rows } = await supabase.rpc("resolve_parrain_info", {
    p_code: code,
  });
  const parrain = rows?.[0] as { id: string; email: string } | undefined;

  if (!parrain || parrain.id === filleulId) return;

  await supabase.from("parrainages").insert({
    parrain_id: parrain.id,
    parrain_email: parrain.email,
    filleul_id: filleulId,
    filleul_email: filleulEmail,
    code_parrainage: code,
    statut: "en_attente",
  });
}

export type ParrainageEnAttente = {
  id: string;
  parrain_id: string;
  parrain_email: string | null;
  filleul_email: string | null;
  created_at: string;
};

export async function getParrainagesEnAttente(
  supabase: SupabaseClient
): Promise<ParrainageEnAttente[]> {
  const { data } = await supabase
    .from("parrainages")
    .select("id, parrain_id, parrain_email, filleul_email, created_at")
    .eq("statut", "en_attente")
    .not("filleul_id", "is", null)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function marquerParrainageConverti(
  supabase: SupabaseClient,
  parrainageId: string
): Promise<{ parrainId: string; parrainEmail: string | null; filleulEmail: string | null } | null> {
  const { data: parrainage } = await supabase
    .from("parrainages")
    .select("parrain_id, parrain_email, filleul_email")
    .eq("id", parrainageId)
    .maybeSingle();

  if (!parrainage) return null;

  await supabase
    .from("parrainages")
    .update({ statut: "converti", converti_at: new Date().toISOString() })
    .eq("id", parrainageId);

  return {
    parrainId: parrainage.parrain_id,
    parrainEmail: parrainage.parrain_email,
    filleulEmail: parrainage.filleul_email,
  };
}

export async function ensureCodeParrainage(
  supabase: SupabaseClient,
  userId: string,
  seed: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("code_parrainage")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.code_parrainage) return profile.code_parrainage;

  const code = await generateUniqueCodeParrainage(supabase, seed);

  await supabase.from("profiles").update({ code_parrainage: code }).eq("id", userId);

  await supabase.from("parrainages").insert({
    parrain_id: userId,
    code_parrainage: code,
    statut: "en_attente",
  });

  return code;
}
