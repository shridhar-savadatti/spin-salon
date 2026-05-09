import { BrevoClient } from "@getbrevo/brevo";
import { SelectedService } from "@/types";

const ADMIN_EMAIL = "spinsalonkudlu2431@gmail.com";

export async function sendBookingNotificationToAdmin(params: {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  services: SelectedService[];
  date: string;
  time: string;
  staffName: string | null;
  totalPrice: number;
  totalDuration: number;
  discountCode?: string;
  finalPrice?: number;
  notes?: string;
}) {
  if (!process.env.BREVO_API_KEY) return;

  const {
    bookingId, customerName, customerPhone, services,
    date, time, staffName, totalPrice, totalDuration,
    discountCode, finalPrice, notes,
  } = params;

  const serviceList = services.map(s =>
    `<tr><td style="padding:6px 0;color:#374151;">${s.name}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#111827;">₹${s.price}</td></tr>`
  ).join("");

  const discountAmount = totalPrice - (finalPrice || totalPrice);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:24px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08);">
    <div style="background:#18181b;padding:24px 28px;">
      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:2px;color:#71717a;text-transform:uppercase;">Spin Unisex Salon, Kudlu</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff;">🔔 New Booking Request</h1>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Customer</td><td style="padding:6px 0;font-weight:700;color:#111827;">${customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Phone</td><td style="padding:6px 0;font-weight:700;"><a href="tel:${customerPhone}" style="color:#111827;">${customerPhone}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Date</td><td style="padding:6px 0;font-weight:700;color:#111827;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Time</td><td style="padding:6px 0;font-weight:700;color:#111827;">${time}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Stylist</td><td style="padding:6px 0;font-weight:700;color:#111827;">${staffName || "Any available"}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Duration</td><td style="padding:6px 0;font-weight:700;color:#111827;">~${totalDuration} mins</td></tr>
        ${notes ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Notes</td><td style="padding:6px 0;color:#111827;">${notes}</td></tr>` : ""}
      </table>
      <div style="background:#f4f4f5;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#71717a;text-transform:uppercase;">Services</p>
        <table style="width:100%;border-collapse:collapse;">
          ${serviceList}
          ${discountCode && discountAmount > 0 ? `<tr><td style="padding:6px 0;color:#16a34a;font-size:13px;">Discount (${discountCode})</td><td style="padding:6px 0;text-align:right;color:#16a34a;font-weight:600;">-₹${discountAmount}</td></tr>` : ""}
          <tr style="border-top:1px solid #e4e4e7;">
            <td style="padding:10px 0 4px;font-weight:700;color:#111827;">Total to Collect</td>
            <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:18px;color:#111827;">₹${finalPrice || totalPrice}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;">
        <a href="https://www.spinkudlu.com/admin/appointments"
          style="display:inline-block;background:#18181b;color:#fff;padding:12px 28px;border-radius:999px;font-weight:600;text-decoration:none;font-size:14px;">
          View in Admin Panel →
        </a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;text-align:center;">Booking ID: ${bookingId}</p>
    </div>
  </div>
</body></html>`;

  try {
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
    await client.transactionalEmails.sendTransacEmail({
      sender: { name: "Spin Salon Booking", email: "noreply@spinkudlu.com" },
      to: [{ email: ADMIN_EMAIL, name: "Spin Unisex Salon" }],
      subject: `🔔 New Booking — ${customerName} | ${date} at ${time}`,
      htmlContent: html,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
    // Don't throw — booking must succeed even if email fails
  }
}
