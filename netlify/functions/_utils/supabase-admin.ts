/**
 * Client Supabase partagé pour les Netlify Functions.
 *
 * @supabase/supabase-js instancie toujours un client Realtime en interne,
 * même si on ne s'en sert jamais (aucune de nos fonctions n'utilise
 * .channel()/.on()/.subscribe()). Ce client Realtime a besoin d'un
 * WebSocket global, absent sur Node 20 (support natif seulement à partir
 * de Node 22), ce qui plante l'initialisation avec "Node.js 20 detected
 * without native WebSocket support". On fournit donc le package `ws`
 * comme transport pour satisfaire ce besoin sans jamais l'utiliser
 * réellement.
 *
 * Toute nouvelle Netlify Function qui a besoin d'un client Supabase doit
 * utiliser createSupabaseAdmin() plutôt que d'appeler createClient()
 * directement.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

export function createSupabaseAdmin(
  supabaseUrl: string,
  supabaseServiceKey: string
): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: {
      transport: WebSocket as unknown as typeof globalThis.WebSocket,
    },
  });
}
