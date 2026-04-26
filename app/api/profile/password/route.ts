import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { oldPassword, newPassword, confirmPassword } = await req.json();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 5) {
      return NextResponse.json({ error: "Password must be at least 5 characters" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { password: hashed, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}