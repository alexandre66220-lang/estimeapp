import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/connexion" || path === "/inscription";

  // Sur les routes publiques de connexion/inscription, on évite l'appel
  // réseau à Supabase quand aucun cookie de session n'est présent : c'est
  // le cas le plus fréquent (visiteur non connecté) et ça évite de
  // ralentir le rendu de ces pages pour rien.
  if (isAuthRoute && !hasSupabaseAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = path.startsWith("/espace");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/espace/tableau-de-bord";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
