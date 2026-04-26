import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  const res = NextResponse.json({ success: true });

res.cookies.set("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 24, // ✅ 1 day
});

  return res;
}