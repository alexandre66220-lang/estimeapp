"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { marquerParrainageConverti } from "@/lib/supabase/parrainage";
import { sendParrainageConverti } from "@/lib/resend/send-parrainage";

const ADMIN_EMAIL = "alcalspark@icloud.com";

export async function marquerConverti(formData: FormData) {
  const parrainageId = formData.get("parrainageId") as string;

  if (!parrainageId) {
    redirect("/admin/parrainages");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/connexion");
  }

  const result = await marquerParrainageConverti(supabase, parrainageId);

  if (result?.parrainEmail) {
    const { count } = await supabase
      .from("parrainages")
      .select("id", { count: "exact", head: true })
      .eq("parrain_id", result.parrainId)
      .eq("statut", "converti");

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name")
      .eq("id", result.parrainId)
      .maybeSingle();

    await sendParrainageConverti({
      parrainEmail: result.parrainEmail,
      parrainNom: profile?.company_name ?? null,
      filleulNom: result.filleulEmail,
      moisGagnes: count ?? 1,
    });
  }

  revalidatePath("/admin/parrainages");
  redirect("/admin/parrainages");
}
