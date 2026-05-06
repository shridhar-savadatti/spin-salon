import { NextRequest, NextResponse } from "next/server";

// In production replace with Nodemailer or a transactional email service
export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  // Log to console — wire up email/webhook here for production
  console.log("Contact form submission:", { name, email, phone, message });

  return NextResponse.json({ message: "Message received. We'll get back to you shortly!" });
}
