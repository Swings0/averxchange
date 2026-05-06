import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    const activePlans = await db.collection("plans")
      .find({ status: "active" }).toArray();

    let processed = 0;

    for (const plan of activePlans) {
      const endDate = new Date(plan.endDate);

      if (now >= endDate) {
        await db.collection("plans").updateOne(
          { _id: plan._id },
          { $set: { status: "expired", tradingAccountBalance: 0 } }
        );

        await db.collection("users").updateOne(
          { _id: new ObjectId(plan.userId) },
          { $inc: { balance: plan.totalProfit ?? 0, totalProfit: plan.totalProfit ?? 0 } }
        );
        continue;
      }

      const lastAccrual = plan.lastAccrualDate ? new Date(plan.lastAccrualDate) : null;
      const hoursSince = lastAccrual
        ? (now.getTime() - lastAccrual.getTime()) / (1000 * 60 * 60)
        : 25;

      if (hoursSince < 24) continue;

      const newBalance = (plan.tradingAccountBalance ?? 0) + (plan.dailyProfit ?? 0);
      await db.collection("plans").updateOne(
        { _id: plan._id },
        { $set: { tradingAccountBalance: newBalance, lastAccrualDate: now } }
      );
      processed++;
    }

    const userIds = [...new Set(activePlans.map((p) => p.userId))];
    for (const userId of userIds) {
      const userPlans = await db.collection("plans")
        .find({ userId, status: "active" }).toArray();
      const total = userPlans.reduce((s, p) => s + (p.tradingAccountBalance ?? 0), 0);
      try {
        await db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          { $set: { tradingAccounts: total } }
        );
      } catch {}
    }

    return NextResponse.json({ success: true, processed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}