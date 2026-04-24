import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.collection("users").updateOne(
    { _id: user._id },
    {
      $set: { password: hashed },
      $unset: { resetToken: "", resetTokenExpiry: "" },
    }
  );

  return NextResponse.json({ message: "Password updated" });
}