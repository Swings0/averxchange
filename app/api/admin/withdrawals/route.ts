import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

// GET — all pending withdrawals
export async function GET() {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const pending = await db
      .collection("transactions")
      .find({ type: "withdrawal", status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = await Promise.all(
      pending.map(async (t) => {
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(t.userId) },
          { projection: { username: 1, fullName: 1, email: 1 } }
        );
        return {
          id: t._id.toString(),
          userId: t.userId,
          userName: user?.username || user?.fullName || "Unknown",
          userEmail: user?.email || "",
          amount: t.amount,
          method: t.method,
          walletAddress: t.walletAddress,
          status: t.status,
          createdAt: t.createdAt?.toISOString() ?? "",
        };
      })
    );

    return NextResponse.json({ withdrawals: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — approve | leavePending | declineWithEmail | declineWithoutEmail
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, action } = await req.json();
    const validActions = ["approve", "leavePending", "declineWithEmail", "declineWithoutEmail"];

    if (!transactionId || !validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const tx = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionId),
    });
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const user = await db.collection("users").findOne({ _id: new ObjectId(tx.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userName = user.username || user.fullName || "User";
    const amt = tx.amount;

    // ── APPROVE ──────────────────────────────────────────────────
    if (action === "approve") {
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        { $set: { status: "approved", approvedAt: new Date() } }
      );

      // Email user
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "✅ Withdrawal Approved!",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">Withdrawal Approved!</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Your withdrawal of <b>$${amt?.toLocaleString()}</b> via <b>${tx.method}</b> has been approved and is being processed.</p>
              <p>Wallet: <code style="font-size:12px;">${tx.walletAddress}</code></p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        });
      } catch (e) { console.error("Approve withdrawal mail error:", e); }

      return NextResponse.json({ success: true, message: "Withdrawal approved" });
    }

    // ── LEAVE PENDING ─────────────────────────────────────────────
    if (action === "leavePending") {
      // Email user to contact support
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "⏳ Withdrawal Processing Update",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">Withdrawal Still Processing</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Your withdrawal of <b>$${amt?.toLocaleString()}</b> is still being processed. Since it's taking longer than usual, please contact our support team to help escalate the issue.</p>
              <p>Email us at: <b>support@averexchange.com</b></p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        });
      } catch (e) { console.error("Leave pending mail error:", e); }

      return NextResponse.json({ success: true, message: "User notified to contact support" });
    }

    // ── DECLINE WITH EMAIL ────────────────────────────────────────
    if (action === "declineWithEmail") {
      // Refund balance
      await db.collection("users").updateOne(
        { _id: new ObjectId(tx.userId) },
        { $inc: { balance: amt } }
      );

      // Update transaction status
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        { $set: { status: "declined", declinedAt: new Date(), refunded: true } }
      );

      // Email user
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "❌ Withdrawal Declined",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#c0392b;">Withdrawal Declined</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Your withdrawal request of <b>$${amt?.toLocaleString()}</b> via <b>${tx.method}</b> has been declined.</p>
              <p>The amount has been <b>refunded to your account balance</b>.</p>
              <p>If you believe this is an error or need assistance, please contact our support team at <b>support@averexchange.com</b>.</p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        });
      } catch (e) { console.error("Decline with email mail error:", e); }

      return NextResponse.json({ success: true, message: "Withdrawal declined, user refunded and notified" });
    }

    // ── DECLINE WITHOUT EMAIL ─────────────────────────────────────
    if (action === "declineWithoutEmail") {
      // Refund balance silently
      await db.collection("users").updateOne(
        { _id: new ObjectId(tx.userId) },
        { $inc: { balance: amt } }
      );

      // Update transaction as reversed (no email)
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        { $set: { status: "reversed", reversedAt: new Date(), refunded: true, emailSent: false } }
      );

      return NextResponse.json({ success: true, message: "Withdrawal reversed silently, user refunded" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}