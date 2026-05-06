import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminApiPayload } from "@/lib/apiAuth";

const ALLOWED_FIELDS = [
  "balance", "totalProfit", "bonus", "tradingAccounts",
  "referralBonus", "totalDeposit", "totalWithdrawal",
];

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getAdminApiPayload(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { email, field, value, delayMs, clearField } = body;

    if (!email || !field || !ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user._id.toString();
    const applyAt = new Date(Date.now() + (delayMs || 0));

    if (clearField) {
      if (!delayMs || delayMs === 0) {
        await db.collection("users").updateOne({ email }, { $set: { [field]: 0 } });
      } else {
        await db.collection("scheduledUpdates").insertOne({
          userId, email, field, value: 0, applyAt, applied: false, type: "clear", createdAt: new Date(),
        });
      }
      return NextResponse.json({
        success: true,
        message: (!delayMs || delayMs === 0) ? `${field} cleared to $0` : `${field} scheduled to clear`,
      });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return NextResponse.json({ error: "Invalid value" }, { status: 400 });

    if (!delayMs || delayMs === 0) {
      await db.collection("users").updateOne({ email }, { $set: { [field]: numValue } });
    } else {
      await db.collection("scheduledUpdates").insertOne({
        userId, email, field, value: numValue, applyAt, applied: false, type: "set", createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: (!delayMs || delayMs === 0)
        ? `${field} updated to $${numValue}`
        : `${field} will update at ${applyAt.toLocaleString()}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await getAdminApiPayload(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    const pending = await db.collection("scheduledUpdates")
      .find({ applied: false, applyAt: { $lte: now } }).toArray();

    for (const update of pending) {
      await db.collection("users").updateOne(
        { email: update.email },
        { $set: { [update.field]: update.value } }
      );
      await db.collection("scheduledUpdates").updateOne(
        { _id: update._id }, { $set: { applied: true } }
      );
    }

    return NextResponse.json({ success: true, applied: pending.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}