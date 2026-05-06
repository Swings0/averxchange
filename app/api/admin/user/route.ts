import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminApiPayload } from "@/lib/apiAuth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await getAdminApiPayload(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = req.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email }, { projection: { password: 0 } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user._id.toString();

    const plans = await db.collection("plans")
      .find({ userId, status: "active" }).sort({ createdAt: -1 }).toArray();

    const deposits = await db.collection("transactions")
      .find({ userId, type: "deposit" }).sort({ createdAt: -1 }).limit(10).toArray();

    const withdrawals = await db.collection("transactions")
      .find({ userId, type: "withdrawal" }).sort({ createdAt: -1 }).limit(10).toArray();

    return NextResponse.json({
      id: userId,
      username: user.username || user.fullName || "User",
      email: user.email,
      balance: user.balance ?? 0,
      totalProfit: user.totalProfit ?? 0,
      bonus: user.bonus ?? 0,
      tradingAccounts: user.tradingAccounts ?? 0,
      referralBonus: user.referralBonus ?? 0,
      totalDeposit: user.totalDeposit ?? 0,
      totalWithdrawal: user.totalWithdrawal ?? 0,
      plans: plans.map((p) => ({
        id: p._id.toString(), name: p.name, price: p.price ?? 0,
        totalProfit: p.totalProfit ?? 0, dailyProfit: p.dailyProfit ?? 0,
        duration: p.duration ?? 21, source: p.source ?? "user",
        startDate: p.startDate?.toISOString() ?? "", endDate: p.endDate?.toISOString() ?? "",
        status: p.status,
      })),
      deposits: deposits.map((d) => ({
        id: d._id.toString(), amount: d.amount, method: d.paymentMethod || d.method,
        status: d.status, date: d.createdAt?.toISOString() ?? "",
      })),
      withdrawals: withdrawals.map((w) => ({
        id: w._id.toString(), amount: w.amount, method: w.method,
        walletAddress: w.walletAddress, status: w.status, date: w.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}