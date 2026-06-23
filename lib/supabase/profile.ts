import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";

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
  const existing = await getCachedProfile(supabase, user.id, "id");

  if (existing) return;

  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    company_name: (user.user_metadata?.company_name as string | undefined) ?? null,
  });
}
