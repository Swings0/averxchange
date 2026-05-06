import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export async function getTokenPayload(): Promise<DecodedToken | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const key = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, key);

    const userId = typeof payload.userId === "object"
      ? String(payload.userId)
      : String(payload.userId ?? "");

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