import { createClient } from "@sanity/client";

let _client: ReturnType<typeof createClient> | null = null;

export function getSanityClient() {
  if (!_client) {
    _client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder",
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
      apiVersion: "2024-01-01",
      useCdn: true,
    });
  }
  return _client;
}
