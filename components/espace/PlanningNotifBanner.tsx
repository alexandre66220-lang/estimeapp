"use client";

import { useEffect, useState } from "react";
import { Bell, BellSlash, CheckCircle } from "@phosphor-icons/react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export function PlanningNotifBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
    const stored = localStorage.getItem("notifications_planning");
    setSubscribed(stored === "true" && Notification.permission === "granted");
  }, []);

  async function handleActivate() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      let reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
      await navigator.serviceWorker.ready;

      if (VAPID_PUBLIC) {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC).buffer as ArrayBuffer,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });
      }

      localStorage.setItem("notifications_planning", "true");
      setSubscribed(true);
    } catch {
      // Si VAPID manquant, on stocke quand même l'intent
      localStorage.setItem("notifications_planning", "true");
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate() {
    localStorage.setItem("notifications_planning", "false");
    setSubscribed(false);
    await fetch("/api/push/subscribe", { method: "DELETE" }).catch(() => {});
  }

  // Ne pas afficher si les notifications ne sont pas supportées
  if (typeof window !== "undefined" && !("Notification" in window)) return null;

  if (subscribed && permission === "granted") {
    return (
      <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
        <CheckCircle size={18} weight="fill" className="text-green-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-green-800 font-medium flex-1">Notifications actives</p>
        <button
          type="button"
          onClick={handleDeactivate}
          className="text-xs text-green-700/60 hover:text-green-700 transition-colors flex items-center gap-1"
        >
          <BellSlash size={13} aria-hidden="true" />
          Désactiver
        </button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2.5 bg-dusk/5 border border-dusk/10 rounded-2xl px-4 py-3 mb-6">
        <BellSlash size={18} className="text-dusk/40 shrink-0" aria-hidden="true" />
        <p className="text-sm text-dusk/60">
          Notifications bloquées par votre navigateur. Autorisez-les dans les paramètres du site.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-ambre/10 border border-ambre/30 rounded-2xl px-4 py-3 mb-6">
      <Bell size={18} className="text-ambre shrink-0" aria-hidden="true" />
      <p className="text-sm text-dusk/80 flex-1">
        Activez les notifications pour être alerté quand publier vos posts.
      </p>
      <button
        type="button"
        onClick={handleActivate}
        disabled={loading}
        className="shrink-0 text-sm font-semibold text-white bg-ambre hover:bg-ambre/80 disabled:opacity-60 px-4 py-1.5 rounded-full transition-colors duration-200"
      >
        {loading ? "…" : "Activer"}
      </button>
    </div>
  );
}
