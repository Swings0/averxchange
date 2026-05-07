import { jwtVerify } from "jose";

export type TokenPayload = {
  userId: string;
};

export async function verifyToken(token?: string) {
  try {
    if (!token) return null;

    const key = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, key);

    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}