import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

// GET — fetch all pending deposits
export async function GET() {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const pending = await db
      .collection("transactions")
      .find({ type: "deposit", status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with user info
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
          paymentMethod: t.paymentMethod,
          proofFileName: t.proofFileName || "",
          status: t.status,
          createdAt: t.createdAt?.toISOString() ?? "",
        };
      })
    );

    return NextResponse.json({ deposits: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — approve or decline a deposit
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, action } = await req.json();
    // action: "approve" | "decline"

    if (!transactionId || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const transaction = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionId),
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(transaction.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = user.username || user.fullName || "User";

    if (action === "approve") {
      // Update transaction to approved
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        { $set: { status: "approved", approvedAt: new Date() } }
      );

      // Credit balance and totalDeposit
      await db.collection("users").updateOne(
        { _id: new ObjectId(transaction.userId) },
        {
          $inc: {
            balance: transaction.amount,
            totalDeposit: transaction.amount,
          },
        }
      );

      // Notify user
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "✅ Deposit Approved!",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">Deposit Approved!</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Your deposit of <b>$${transaction.amount.toLocaleString()}</b> via <b>${transaction.paymentMethod}</b> has been approved and credited to your account.</p>
              <p>Your new balance reflects this deposit. Thank you for investing with us!</p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Approve mail error:", e);
      }

      return NextResponse.json({ success: true, message: "Deposit approved and balance credited" });
    }

    if (action === "decline") {
      // Delete transaction entirely
      await db.collection("transactions").deleteOne({
        _id: new ObjectId(transactionId),
      });

      // Notify user
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "❌ Deposit Declined",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#c0392b;">Deposit Declined</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Unfortunately, your deposit of <b>$${transaction.amount.toLocaleString()}</b> via <b>${transaction.paymentMethod}</b> could not be verified and has been declined.</p>
              <p>If you believe this is an error, please contact our support team with your payment proof.</p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Decline mail error:", e);
      }

      return NextResponse.json({ success: true, message: "Deposit declined and removed" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}