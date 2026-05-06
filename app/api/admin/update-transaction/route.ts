import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

// PATCH — approve or decline a withdrawal
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, action } = await req.json();
    if (!transactionId || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const tx = await db.collection("transactions").findOne({ _id: new ObjectId(transactionId) });
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const user = await db.collection("users").findOne({ _id: new ObjectId(tx.userId) });
    const userName = user?.username || user?.fullName || "User";

    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: { status: action === "approve" ? "approved" : "declined", updatedAt: new Date() } }
    );

    // If withdrawal declined — refund balance
    if (action === "decline" && tx.type === "withdrawal") {
      await db.collection("users").updateOne(
        { _id: new ObjectId(tx.userId) },
        { $inc: { balance: tx.amount } }
      );
    }

    if (user) {
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: action === "approve"
            ? `✅ Withdrawal Approved — $${tx.amount?.toLocaleString()}`
            : `❌ Withdrawal Declined — $${tx.amount?.toLocaleString()}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2>${action === "approve" ? "Withdrawal Approved!" : "Withdrawal Declined"}</h2>
              <p>Hi <b>${userName}</b>,</p>
              ${action === "approve"
                ? `<p>Your withdrawal of <b>$${tx.amount?.toLocaleString()}</b> via <b>${tx.method}</b> has been approved and is being processed.</p>`
                : `<p>Your withdrawal of <b>$${tx.amount?.toLocaleString()}</b> has been declined. The amount has been refunded to your account balance.</p>`
              }
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        });
      } catch (e) { console.error("Transaction email error:", e); }
    }

    return NextResponse.json({ success: true, message: `Transaction ${action}d` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove a transaction entirely
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId } = await req.json();
    if (!transactionId) return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    await db.collection("transactions").deleteOne({ _id: new ObjectId(transactionId) });
    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}