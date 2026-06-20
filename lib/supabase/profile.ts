import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    company_name: (user.user_metadata?.company_name as string | undefined) ?? null,
  });
}
