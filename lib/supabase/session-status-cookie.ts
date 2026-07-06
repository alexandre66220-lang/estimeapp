/**
 * Cache signé (httpOnly) du statut onboarding/abonnement, utilisé par le
 * middleware pour éviter de requêter la table `profiles` à chaque
 * navigation sous /espace/*. Ne remplace jamais auth.getUser() : ce cookie
 * ne porte aucune information de session, uniquement un statut métier à
 * durée de vie courte (1h) qui retombe sur Supabase dès qu'il est absent,
 * expiré ou invalide.
 *
 * Web Crypto (crypto.subtle) est utilisé plutôt que le module `crypto` de
 * Node pour rester compatible avec le runtime Edge du middleware.
 */

export const SESSION_STATUS_COOKIE = "estime_session_status";
const TTL_MS = 60 * 60 * 1000;

export type SessionStatus = {
  onboardingComplete: boolean;
  isSubscribed: boolean;
  trialEnd: string | null;
};

type SignedPayload = SessionStatus & { exp: number };

function getSecret(): string | null {
  return process.env.SESSION_STATUS_SECRET || null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Retourne null si SESSION_STATUS_SECRET n'est pas configuré : le cache est
 * alors désactivé sans casser le middleware, qui retombe simplement sur une
 * requête Supabase à chaque navigation (comportement actuel).
 */
export async function signSessionStatus(status: SessionStatus): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const payload: SignedPayload = { ...status, exp: Date.now() + TTL_MS };
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmac(secret, payloadB64);
  return `${payloadB64}.${signature}`;
}

export async function verifySessionStatus(
  cookieValue: string | undefined | null
): Promise<SessionStatus | null> {
  const secret = getSecret();
  if (!secret || !cookieValue) return null;

  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payloadB64 = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);

  const expectedSignature = await hmac(secret, payloadB64);
  if (!constantTimeEqual(signature, expectedSignature)) return null;

  try {
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(json) as SignedPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return {
      onboardingComplete: payload.onboardingComplete,
      isSubscribed: payload.isSubscribed,
      trialEnd: payload.trialEnd,
    };
  } catch {
    return null;
  }
}

export const SESSION_STATUS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: TTL_MS / 1000,
};
