"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = "BDVIN_QoP_j66wpUePQCnPMcI6uMChvno18xfwsJY-lB9kUTPraiqoV-EfcpHcF1qawLfIk8EdKWEDprb5qQlQU";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushToggle() {
  const [status, setStatus] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed">("loading");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async reg => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) setStatus("subscribed");
      else if (Notification.permission === "denied") setStatus("denied");
      else setStatus("unsubscribed");
    });
  }, []);

  const subscribe = async () => {
    setToggling(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setStatus("subscribed");
    } catch (err) {
      console.error("Subscribe failed:", err);
      setStatus(Notification.permission === "denied" ? "denied" : "unsubscribed");
    }
    setToggling(false);
  };

  const unsubscribe = async () => {
    setToggling(true);
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
      setStatus("unsubscribed");
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
    setToggling(false);
  };

  if (status === "loading" || status === "unsupported") return null;

  return (
    <button
      onClick={status === "subscribed" ? unsubscribe : subscribe}
      disabled={toggling || status === "denied"}
      title={status === "denied" ? "Notifications blocked in browser settings" : status === "subscribed" ? "Notifications ON — tap to turn off" : "Turn on booking notifications"}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
        status === "subscribed"
          ? "bg-green-900/40 text-green-400 hover:bg-red-900/30 hover:text-red-400"
          : status === "denied"
          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
      } disabled:opacity-50`}
    >
      {status === "subscribed" ? <Bell size={14} /> : <BellOff size={14} />}
      {toggling ? "..." : status === "subscribed" ? "Notifications ON" : status === "denied" ? "Blocked" : "Enable Notifications"}
    </button>
  );
}
