import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    // ✅ NextAuth session (replaces manual JWT auth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const client = await clientPromise;
    const db = client.db();

    // ── Fetch transactions ─────────────────────────
    const all = await db
      .collection("transactions")
      .find({
        userId,
        $or: [
          { type: "deposit", status: "approved" },
          { type: "withdrawal" },
          { type: "transfer_out", status: "approved" },
          { type: "transfer_in", status: "approved" },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // ── Response ───────────────────────────────────
    return NextResponse.json({
      transactions: all.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        method: t.paymentMethod || t.method || "",
        status: t.status,
        walletAddress: t.walletAddress || "",
        recipientEmail: t.recipientEmail || "",
        senderEmail: t.senderEmail || "",
        date: t.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    console.error("TRANSACTIONS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}