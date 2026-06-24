import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ensureCodeParrainage } from "@/lib/supabase/parrainage";

export function profileCacheTag(userId: string) {
  return `profile-${userId}`;
}

export function getCachedProfile<T = { id: string }>(
  supabase: SupabaseClient,
  userId: string,
  columns: string
): Promise<T | null> {
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from("profiles")
        .select(columns)
        .eq("id", userId)
        .maybeSingle();
      return data as T | null;
    },
    ["profile", userId, columns],
    { revalidate: 3600, tags: [profileCacheTag(userId)] }
  )();
}

export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const existing = await getCachedProfile<{ id: string; code_parrainage: string | null }>(
    supabase,
    user.id,
    "id, code_parrainage"
  );

  const companyName = (user.user_metadata?.company_name as string | undefined) ?? null;

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      company_name: companyName,
    });
  }

  if (!existing?.code_parrainage) {
    await ensureCodeParrainage(supabase, user.id, companyName ?? user.email ?? user.id);
  }
}
