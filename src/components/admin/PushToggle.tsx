"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const VAPID_PUBLIC_KEY = "BDVIN_QoP_j66wpUePQCnPMcI6uMChvno18xfwsJY-lB9kUTPraiqoV-EfcpHcF1qawLfIk8EdKWEDprb5qQlQU";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function doSubscribe() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
  return sub;
}

export default function PushToggle() {
  const [status, setStatus] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "prompt">("loading");
  const [showBanner, setShowBanner] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    navigator.serviceWorker.register("/sw.js").then(async reg => {
      await navigator.serviceWorker.ready;

      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      const existing = await reg.pushManager.getSubscription();

      if (existing) {
        // Already subscribed — silently re-register to ensure DB has it
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(existing.toJSON()),
        }).catch(() => {});
        setStatus("subscribed");
        return;
      }

      if (Notification.permission === "granted") {
        // Permission already granted — auto-subscribe silently
        try {
          await doSubscribe();
          setStatus("subscribed");
        } catch {
          setStatus("prompt");
          setShowBanner(true);
        }
      } else {
        // Need to ask — show banner
        setStatus("prompt");
        setShowBanner(true);
      }
    });
  }, []);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await doSubscribe();
      setStatus("subscribed");
      setShowBanner(false);
    } catch {
      if (Notification.permission === "denied") setStatus("denied");
    }
    setEnabling(false);
  };

  const handleDisable = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("prompt");
      setShowBanner(false);
    } catch { /* ignore */ }
  };

  if (status === "loading" || status === "unsupported") return null;

  return (
    <>
      {/* Prominent banner — shown only when permission not yet granted */}
      {showBanner && status === "prompt" && (
        <div className="mx-3 mb-3 rounded-xl bg-amber-500/20 border border-amber-500/40 p-3">
          <div className="flex items-start gap-2">
            <Bell size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-300 mb-1">Enable booking alerts</p>
              <p className="text-xs text-zinc-400 mb-2">Get notified instantly when someone books.</p>
              <button onClick={handleEnable} disabled={enabling}
                className="w-full rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-white hover:bg-amber-400 disabled:opacity-50 transition">
                {enabling ? "Enabling..." : "Enable Now"}
              </button>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-zinc-500 hover:text-zinc-300">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Small status indicator */}
      {status === "subscribed" && (
        <button onClick={handleDisable}
          title="Notifications ON — tap to turn off"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium bg-green-900/30 text-green-400 hover:bg-red-900/20 hover:text-red-400 transition">
          <Bell size={13} /> Notifications ON
        </button>
      )}

      {status === "denied" && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500">
          <Bell size={13} /> Notifications blocked
        </div>
      )}
    </>
  );
}
