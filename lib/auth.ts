import jwt from "jsonwebtoken";
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
}