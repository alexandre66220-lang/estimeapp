import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_STATUS_COOKIE,
  SESSION_STATUS_COOKIE_OPTIONS,
  signSessionStatus,
  verifySessionStatus,
} from "@/lib/supabase/session-status-cookie";

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

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // Échec réseau lors de l'appel à Supabase : on ne redirige pas vers
    // /connexion (ça déconnecterait un utilisateur dont la session est en
    // fait valide), on laisse passer la requête et c'est la page elle-même
    // qui gérera l'erreur (cf. app/espace/error.tsx).
    console.error("[middleware] échec réseau lors de auth.getUser() :", error);
    return supabaseResponse;
  }

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

  const isOnboardingRoute = path === "/espace/onboarding";
  const isAbonnementRoute = path === "/espace/abonnement";

  // applyCookie() reporte le cookie de cache (et les éventuels cookies
  // d'auth rafraîchis par Supabase sur supabaseResponse) sur la réponse
  // finalement retournée, y compris en cas de redirect : sans ça, un
  // NextResponse.redirect() construit séparément perdrait silencieusement
  // ces cookies.
  function applyCookie(response: NextResponse, signedValue?: string | null) {
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    if (signedValue) {
      response.cookies.set(SESSION_STATUS_COOKIE, signedValue, SESSION_STATUS_COOKIE_OPTIONS);
    }
    return response;
  }

  if (isProtectedRoute && user) {
    // Juste après un retour de paiement Stripe (Payment Link), le webhook
    // qui met à jour is_subscribed peut ne pas encore avoir tourné : on
    // ignore le cache et on force une requête fraîche pour ne pas renvoyer
    // un client qui vient de payer vers la page d'abonnement.
    const bypassCache = request.nextUrl.searchParams.get("payment") === "success";

    const cached = bypassCache
      ? null
      : await verifySessionStatus(request.cookies.get(SESSION_STATUS_COOKIE)?.value);

    let onboardingComplete: boolean;
    let isSubscribed: boolean;
    let trialEnd: Date | null;
    let signedValue: string | null = null;

    if (cached) {
      onboardingComplete = cached.onboardingComplete;
      isSubscribed = cached.isSubscribed;
      trialEnd = cached.trialEnd ? new Date(cached.trialEnd) : null;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete, is_subscribed, trial_end")
        .eq("id", user.id)
        .maybeSingle();

      onboardingComplete = profile?.onboarding_complete ?? false;
      isSubscribed = profile?.is_subscribed ?? false;
      trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null;

      signedValue = await signSessionStatus({
        onboardingComplete,
        isSubscribed,
        trialEnd: profile?.trial_end ?? null,
      });
    }

    if (!onboardingComplete && !isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/espace/onboarding";
      url.search = "";
      return applyCookie(NextResponse.redirect(url), signedValue);
    }

    if (onboardingComplete && isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/espace/tableau-de-bord";
      url.search = "";
      return applyCookie(NextResponse.redirect(url), signedValue);
    }

    const trialExpired = !isSubscribed && (!trialEnd || trialEnd.getTime() < Date.now());

    if (trialExpired && !isAbonnementRoute && !isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/espace/abonnement";
      url.search = "";
      url.searchParams.set("error", "Votre essai gratuit est terminé");
      return applyCookie(NextResponse.redirect(url), signedValue);
    }

    return applyCookie(supabaseResponse, signedValue);
  }

  return supabaseResponse;
}
