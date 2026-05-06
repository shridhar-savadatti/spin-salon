import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db";
import { signToken, COOKIE_NAME, AdminRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const redirect = (path: string, cookie?: string) => {
    const res = NextResponse.redirect(`${protocol}://${host}${path}`, { status: 303 });
    if (cookie) {
      res.cookies.set(COOKIE_NAME, cookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }
    return res;
  };

  if (!username || !password) return redirect("/admin/login?error=missing");

  const sql = getSql();
  const rows = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
  const user = rows[0] as { id: string; username: string; password_hash: string; role: AdminRole } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return redirect("/admin/login?error=invalid");
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  const dest = user.role === "blog" ? "/admin/blog" : "/admin/appointments";
  return redirect(dest, token);
}
