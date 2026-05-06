import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminApiPayload } from "@/lib/apiAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await getAdminApiPayload(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const pending = await db.collection("transactions")
      .find({ type: "deposit", status: "pending" })
      .sort({ createdAt: -1 }).toArray();

    const enriched = await Promise.all(pending.map(async (t) => {
      let userName = "Unknown", userEmail = "";
      try {
        const user = await db.collection("users").findOne(
          { _id: new ObjectId(t.userId) },
          { projection: { username: 1, fullName: 1, email: 1 } }
        );
        userName = user?.username || user?.fullName || "Unknown";
        userEmail = user?.email || "";
      } catch {}
      return {
        id: t._id.toString(), userId: t.userId, userName, userEmail,
        amount: t.amount, paymentMethod: t.paymentMethod,
        proofFileName: t.proofFileName || "", status: t.status,
        createdAt: t.createdAt?.toISOString() ?? "",
      };
    }));

    return NextResponse.json({ deposits: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getAdminApiPayload(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, action } = await req.json();
    if (!transactionId || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const tx = await db.collection("transactions").findOne({ _id: new ObjectId(transactionId) });
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const user = await db.collection("users").findOne({ _id: new ObjectId(tx.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userName = user.username || user.fullName || "User";

    if (action === "approve") {
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        { $set: { status: "approved", approvedAt: new Date() } }
      );
      await db.collection("users").updateOne(
        { _id: new ObjectId(tx.userId) },
        { $inc: { balance: tx.amount, totalDeposit: tx.amount } }
      );
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "✅ Deposit Approved!",
          html: `<div style="font-family:sans-serif;max-width:600px;">
            <h2>Deposit Approved!</h2>
            <p>Hi <b>${userName}</b>,</p>
            <p>Your deposit of <b>$${tx.amount?.toLocaleString()}</b> via <b>${tx.paymentMethod}</b> has been approved and credited to your account.</p>
            <p>— The Aver Exchange Team</p>
          </div>`,
        });
      } catch (e) { console.error(e); }
      return NextResponse.json({ success: true, message: "Deposit approved and balance credited" });
    }

    if (action === "decline") {
      await db.collection("transactions").deleteOne({ _id: new ObjectId(transactionId) });
      try {
        await transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "❌ Deposit Declined",
          html: `<div style="font-family:sans-serif;max-width:600px;">
            <h2>Deposit Declined</h2>
            <p>Hi <b>${userName}</b>,</p>
            <p>Your deposit of <b>$${tx.amount?.toLocaleString()}</b> could not be verified and has been declined.</p>
            <p>Contact support if you believe this is an error.</p>
            <p>— The Aver Exchange Team</p>
          </div>`,
        });
      } catch (e) { console.error(e); }
      return NextResponse.json({ success: true, message: "Deposit declined and removed" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}