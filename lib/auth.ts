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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Handle both string userId and ObjectId object (backwards compatibility)
    const userId = typeof decoded.userId === "object"
      ? decoded.userId.toString()
      : decoded.userId;

    return { userId, iat: decoded.iat, exp: decoded.exp };
  } catch {
    return null;
  }
}









// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";

// export interface DecodedToken {
//   userId: string;
//   iat: number;
//   exp: number;
// }

// export async function getTokenPayload(): Promise<DecodedToken | null> {
//   try {
//     const token = (await cookies()).get("token")?.value;
//     if (!token) return null;

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET!
//     ) as DecodedToken;

//     return decoded;
//   } catch {
//     return null;
//   }
// }






// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";

// export interface DecodedToken {
//   userId: string;
//   iat: number;
//   exp: number;
// }

// export async function getTokenPayload(): Promise<DecodedToken | null> {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;
//     if (!token) return null;
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET!
//     ) as DecodedToken;
//     return decoded;
//   } catch {
//     return null;
//   }
// }