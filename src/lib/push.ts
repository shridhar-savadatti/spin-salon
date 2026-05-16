import webpush from "web-push";
import { getSql } from "@/lib/db";

export async function sendPushToAdmin(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return;

  // Set VAPID details inside the function — not at module level (breaks build)
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || "spinsalonkudlu2431@gmail.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    const sql = getSql();
    const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions` as {
      endpoint: string; p256dh: string; auth: string;
    }[];

    if (subs.length === 0) return;

    const notification = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/admin/appointments",
    });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        )
      )
    );

    // Remove expired/invalid subscriptions
    const failed = results
      .map((r, i) => ({ r, sub: subs[i] }))
      .filter(({ r }) => r.status === "rejected");

    for (const { sub } of failed) {
      await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`.catch(() => {});
    }
  } catch (err) {
    console.error("Push notification failed:", err);
  }
}
