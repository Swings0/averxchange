import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getApiTokenPayload } from "@/lib/apiAuth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const payload = await getApiTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const all = await db.collection("transactions")
      .find({
        userId: payload.userId,
        $or: [
          { type: "deposit", status: "approved" },
          { type: "withdrawal" },
          { type: "transfer_out", status: "approved" },
          { type: "transfer_in", status: "approved" },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      transactions: all.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        method: t.paymentMethod || t.method || "",
        status: t.status,
        walletAddress: t.walletAddress || "",
        date: t.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}