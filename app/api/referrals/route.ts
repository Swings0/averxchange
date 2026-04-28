import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Find who referred this user
    let referredByUser = null;
    if (user.referredBy) {
      referredByUser = await db.collection("users").findOne(
        { _id: new ObjectId(user.referredBy) },
        { projection: { username: 1, fullName: 1 } }
      );
    }

    // Find all users this user referred
    const referrals = await db
      .collection("users")
      .find(
        { referredBy: payload.userId },
        { projection: { username: 1, fullName: 1, email: 1, createdAt: 1, balance: 1 } }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      referralCode: user.referralCode || user.username || "",
      referralBonus: user.referralBonus ?? 0,
      referredBy: referredByUser
        ? { name: referredByUser.username || referredByUser.fullName }
        : null,
      referrals: referrals.map((r) => ({
        id: r._id.toString(),
        name: r.username || r.fullName || "User",
        email: r.email,
        status: r.balance > 0 ? "active" : "registered",
        joinedAt: r.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}