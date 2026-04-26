import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      displayName: user.username || user.fullName || "User",
      email: user.email,
      fullName: user.fullName ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
      country: user.country ?? "",
      withdrawalSettings: user.withdrawalSettings ?? {},
      balance: user.balance ?? 0,
      totalProfit: user.totalProfit ?? 0,
      bonus: user.bonus ?? 0,
      tradingAccounts: user.tradingAccounts ?? 0,
      referralBonus: user.referralBonus ?? 0,
      totalDeposit: user.totalDeposit ?? 0,
      totalWithdrawal: user.totalWithdrawal ?? 0,
      referralCode: user.referralCode || "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}