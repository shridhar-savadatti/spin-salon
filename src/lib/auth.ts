import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "salon-secret-key-change-in-production";
const COOKIE_NAME = "salon_admin_token";

export type AdminRole = "store" | "blog";

export interface AdminSession {
  userId: string;
  username: string;
  role: AdminRole;
}

export function signToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireRole(role: AdminRole): Promise<AdminSession | null> {
  const session = await getAdminSession();
  if (!session) return null;
  if (session.role !== role) return null;
  return session;
}

export { COOKIE_NAME };
