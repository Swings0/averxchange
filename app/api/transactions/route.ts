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

    // Deposits: only approved ones show to user
    const deposits = await db
      .collection("transactions")
      .find({ userId: payload.userId, type: "deposit", status: "approved" })
      .sort({ createdAt: -1 })
      .toArray();

    // Withdrawals: show all (pending + approved)
    const withdrawals = await db
      .collection("transactions")
      .find({ userId: payload.userId, type: "withdrawal" })
      .sort({ createdAt: -1 })
      .toArray();

    // Merge and sort by date
    const all = [...deposits, ...withdrawals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      transactions: all.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        method: t.paymentMethod || t.method || "",
        status: t.status,
        date: t.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}