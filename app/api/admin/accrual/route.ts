import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// This should be called by a cron job every 24 hours
// Or call it from the my-plans page to get real-time accrual
export async function GET(req: NextRequest) {
  try {
    // Simple secret check to prevent public access
    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    // Get all active plans
    const activePlans = await db
      .collection("adminPlans")
      .find({ status: "active" })
      .toArray();

    let processed = 0;

    for (const plan of activePlans) {
      const endDate = new Date(plan.endDate);

      // Check if plan has expired
      if (now >= endDate) {
        // Expire the plan — reset trading account for this plan
        await db.collection("adminPlans").updateOne(
          { _id: plan._id },
          { $set: { status: "expired", tradingAccountBalance: 0 } }
        );

        // Recalculate total trading account for this user
        const remainingPlans = await db
          .collection("adminPlans")
          .find({ userId: plan.userId, status: "active" })
          .toArray();

        const totalTradingBalance = remainingPlans.reduce(
          (sum, p) => sum + (p.tradingAccountBalance ?? 0), 0
        );

        await db.collection("users").updateOne(
          { _id: plan.userId },
          { $set: { tradingAccounts: totalTradingBalance } }
        );
        continue;
      }

      // Check if we already accrued today
      const lastAccrual = plan.lastAccrualDate ? new Date(plan.lastAccrualDate) : null;
      const hoursSinceAccrual = lastAccrual
        ? (now.getTime() - lastAccrual.getTime()) / (1000 * 60 * 60)
        : 25;

      if (hoursSinceAccrual < 24) continue;

      // Add daily profit
      const newBalance = (plan.tradingAccountBalance ?? 0) + plan.dailyProfit;

      await db.collection("adminPlans").updateOne(
        { _id: plan._id },
        {
          $set: {
            tradingAccountBalance: newBalance,
            lastAccrualDate: now,
          },
        }
      );

      processed++;
    }

    // Update each user's total trading account balance
    const userIds = [...new Set(activePlans.map((p) => p.userId))];
    for (const userId of userIds) {
      const userPlans = await db
        .collection("adminPlans")
        .find({ userId, status: "active" })
        .toArray();

      const total = userPlans.reduce((sum, p) => sum + (p.tradingAccountBalance ?? 0), 0);

      await db.collection("users").updateOne(
        { _id: userId as any },
        { $set: { tradingAccounts: total } }
      );
    }

    return NextResponse.json({ success: true, processed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}