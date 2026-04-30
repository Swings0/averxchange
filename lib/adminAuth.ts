import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface AdminToken {
  adminId: string;
  role: "admin";
  iat: number;
  exp: number;
}

export async function getAdminPayload(): Promise<AdminToken | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET!) as AdminToken;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}