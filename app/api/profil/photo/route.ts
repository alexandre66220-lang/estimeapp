import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateTag } from "next/cache";
import { profileCacheTag } from "@/lib/supabase/profile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Format non supporté." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const resized = await sharp(Buffer.from(bytes))
    .resize(400, 400, { fit: "cover", position: "center" })
    .jpeg({ quality: 85 })
    .toBuffer();

  const admin = createAdminClient();
  const path = `photos/${user.id}.jpg`;

  const { error: uploadError } = await admin.storage
    .from("profiles")
    .upload(path, resized, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    // Try creating bucket if it doesn't exist
    await admin.storage.createBucket("profiles", { public: false });
    const { error: retry } = await admin.storage
      .from("profiles")
      .upload(path, resized, { contentType: "image/jpeg", upsert: true });
    if (retry) return NextResponse.json({ error: "Erreur upload." }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({ photo_profil: path })
    .eq("id", user.id);

  updateTag(profileCacheTag(user.id));
  return NextResponse.json({ success: true, path });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const admin = createAdminClient();
  await admin.storage.from("profiles").remove([`photos/${user.id}.jpg`]);
  await supabase.from("profiles").update({ photo_profil: null }).eq("id", user.id);
  updateTag(profileCacheTag(user.id));
  return NextResponse.json({ success: true });
}
