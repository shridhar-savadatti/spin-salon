import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Customer {
  name: string;
  phone: string;
  message: string;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    return NextResponse.json({
      error: "Meta API not configured. Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to Vercel environment variables.",
    }, { status: 503 });
  }

  const { customers }: { customers: Customer[] } = await req.json();
  if (!customers?.length) {
    return NextResponse.json({ error: "No customers provided" }, { status: 400 });
  }

  const results: { phone: string; name: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const customer of customers) {
    const digits = customer.phone.replace(/\D/g, "");
    const phone = digits.length === 10 ? `91${digits}` : digits;

    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: { body: customer.message },
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.messages?.[0]?.id) {
        results.push({ phone, name: customer.name, status: "sent" });
      } else {
        results.push({
          phone, name: customer.name, status: "failed",
          error: data.error?.message || "Unknown error",
        });
      }
    } catch (err) {
      results.push({
        phone, name: customer.name, status: "failed",
        error: err instanceof Error ? err.message : "Network error",
      });
    }

    // Small delay between messages to respect Meta rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  const sent = results.filter(r => r.status === "sent").length;
  const failed = results.filter(r => r.status === "failed").length;

  return NextResponse.json({
    message: `Sent: ${sent}, Failed: ${failed}`,
    sent, failed, results,
    estimatedCost: `₹${(sent * 0.73).toFixed(2)}`,
  });
}
