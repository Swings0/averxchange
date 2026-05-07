import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export async function getTokenPayload(): Promise<DecodedToken | null> {
  try {
    const cookieStore = await cookies(); // ✅ FIX HERE
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    return jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
  } catch {
    return null;
  }
}