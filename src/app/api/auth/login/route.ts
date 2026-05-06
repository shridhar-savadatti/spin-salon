import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db";
import { signToken, COOKIE_NAME, AdminRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const sql = getSql();
  const rows = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
  const user = rows[0] as { id: string; username: string; password_hash: string; role: AdminRole } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  const redirectTo = user.role === "blog" ? "/admin/blog" : "/admin/appointments";

  const response = NextResponse.json({ message: "Login successful", username: user.username, role: user.role, redirectTo });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return response;
}
