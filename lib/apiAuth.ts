import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export async function getApiTokenPayload(
  req: NextRequest
): Promise<DecodedToken | null> {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const key = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, key);

    const userId = String(payload.userId ?? "");
    if (!userId) return null;

    return {
      userId,
      iat: payload.iat ?? 0,
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getAdminApiPayload(
  req: NextRequest
): Promise<boolean> {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return false;

    const key = new TextEncoder().encode(process.env.ADMIN_SECRET!);
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin";
  } catch {
    return false;
  }
}