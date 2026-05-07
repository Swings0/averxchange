import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth"; // NextAuth v5 style
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { planId, amount } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const plan = await db.collection("plans_meta").findOne({ id: planId });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amt = Number(amount);

    if (isNaN(amt) || amt !== plan.price) {
      return NextResponse.json(
        { error: `This plan requires exactly $${plan.price}` },
        { status: 400 }
      );
    }

    // ✅ FIXED ObjectId usage
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // max active plans check
    const activePlanCount = await db.collection("plans").countDocuments({
      userId: new ObjectId(userId),
      status: "active",
    });

    if (activePlanCount >= 5) {
      return NextResponse.json(
        { error: "Maximum of 5 active plans allowed" },
        { status: 400 }
      );
    }

    const balance = user.balance ?? 0;

    if (amt > balance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const now = new Date();
    const endDate = new Date(
      now.getTime() + plan.duration * 24 * 60 * 60 * 1000
    );

    const newBalance = balance - amt;

    // deduct balance
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { balance: newBalance } }
    );

    // create plan
    await db.collection("plans").insertOne({
      userId: new ObjectId(userId), // ✅ FIXED TYPE SAFETY
      planId: plan.id,
      name: plan.name,
      price: plan.price,
      totalProfit: plan.totalProfit,
      dailyProfit: plan.dailyProfit,
      profitPct: plan.profitPct,
      duration: plan.duration,
      status: "active",
      source: "user",
      startDate: now,
      endDate,
      lastAccrualDate: now,
      accruedProfit: 0,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      newBalance,
    });
  } catch (err) {
    console.error("plans error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}