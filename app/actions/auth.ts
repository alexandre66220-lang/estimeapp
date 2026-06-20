"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { translateAuthError } from "@/lib/supabase/auth-errors";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      `/connexion?error=${encodeURIComponent("Tous les champs sont obligatoires.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/connexion?error=${encodeURIComponent(translateAuthError(error.message))}`
    );
  }

  redirect("/espace/tableau-de-bord");
}

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const companyName = (formData.get("companyName") as string)?.trim();

  if (!email || !password || !companyName) {
    redirect(
      `/inscription?error=${encodeURIComponent("Tous les champs sont obligatoires.")}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName },
    },
  });

  if (error) {
    redirect(
      `/inscription?error=${encodeURIComponent(translateAuthError(error.message))}`
    );
  }

  if (data.user && data.session) {
    await ensureProfile(supabase, data.user);
    redirect("/espace/tableau-de-bord");
  }

  redirect(
    `/connexion?message=${encodeURIComponent(
      "Compte créé. Vérifiez vos emails pour confirmer votre adresse, puis connectez-vous."
    )}`
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
