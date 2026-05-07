import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    // ✅ NextAuth session (replaces getUserFromRequest)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const client = await clientPromise;
    const db = client.db();

    // ── Fetch current user ─────────────────────────
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Find who referred this user ────────────────
    let referredByUser = null;

    if (user.referredBy) {
      referredByUser = await db.collection("users").findOne(
        { _id: new ObjectId(user.referredBy) },
        { projection: { username: 1, fullName: 1 } }
      );
    }

    // ── Find referrals made by this user ──────────
    const referrals = await db
      .collection("users")
      .find(
        { referredBy: userId },
        {
          projection: {
            username: 1,
            fullName: 1,
            email: 1,
            createdAt: 1,
            balance: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    // ── Response ───────────────────────────────────
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
    console.error("REFERRAL ROUTE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}