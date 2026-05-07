import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export function signToken(payload: { userId: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15h",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}