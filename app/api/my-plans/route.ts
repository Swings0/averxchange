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
    const now = new Date();

    // ── 1. Apply any pending scheduled stat updates ──
    const pendingUpdates = await db
      .collection("scheduledUpdates")
      .find({ userId: payload.userId, applied: false, applyAt: { $lte: now } })
      .toArray();

    for (const u of pendingUpdates) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(payload.userId) },
        { $set: { [u.field]: u.value } }
      );
      await db.collection("scheduledUpdates").updateOne(
        { _id: u._id },
        { $set: { applied: true } }
      );
    }

    // ── 2. Activate any admin plans whose startDate has arrived ──
    await db.collection("plans").updateMany(
      { userId: payload.userId, status: "pending", startDate: { $lte: now } },
      { $set: { status: "active", lastAccrualDate: now } }
    );

    // ── 3. Check expired plans and credit profit to balance ──
    const expiredPlans = await db
      .collection("plans")
      .find({ userId: payload.userId, status: "active", endDate: { $lte: now } })
      .toArray();

    if (expiredPlans.length > 0) {
      // Sum all profits from expired plans
      const totalProfitToCredit = expiredPlans.reduce(
        (sum, p) => sum + (p.totalProfit ?? 0), 0
      );

      // Mark plans as expired
      const expiredIds = expiredPlans.map((p) => p._id);
      await db.collection("plans").updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: "expired" } }
      );

      // Credit profit to user balance
      await db.collection("users").updateOne(
        { _id: new ObjectId(payload.userId) },
        { $inc: { balance: totalProfitToCredit, totalProfit: totalProfitToCredit } }
      );
    }

    // ── 4. Fetch active plans (both user-purchased and admin-loaded) ──
    const activePlans = await db
      .collection("plans")
      .find({ userId: payload.userId, status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    // ── 5. Get updated user data ──
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { balance: 1, totalProfit: 1 } }
    );

    return NextResponse.json({
      plans: activePlans.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        planId: p.planId,
        price: p.price ?? 0,
        totalProfit: p.totalProfit ?? 0,
        dailyProfit: p.dailyProfit ?? 0,
        profitPct: p.profitPct ?? 0,
        duration: p.duration ?? 21,
        source: p.source ?? "user",
        startDate: p.startDate?.toISOString() ?? now.toISOString(),
        endDate: p.endDate?.toISOString() ?? now.toISOString(),
        status: p.status,
      })),
      balance: user?.balance ?? 0,
      totalProfit: user?.totalProfit ?? 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}