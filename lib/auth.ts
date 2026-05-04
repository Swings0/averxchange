import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const key = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, key);

    const userId =
      typeof payload.userId === "object"
        ? payload.userId?.toString()
        : String(payload.userId);

    if (!userId) return null;

    return {
      userId,
      iat: Number(payload.iat),
      exp: Number(payload.exp),
    };
  } catch {
    return null;
  }
}