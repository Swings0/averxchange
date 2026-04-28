import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, method, walletAddress, password } = await req.json();

    if (!amount || !method || !walletAddress || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 100) {
      return NextResponse.json({ error: "Minimum withdrawal is $100" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify password before allowing withdrawal
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    const currentBalance = user.balance ?? 0;
    if (amt > currentBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct balance immediately
    const newBalance = parseFloat((currentBalance - amt).toFixed(2));
    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { balance: newBalance } }
    );

    // Save as pending — stays pending until admin approves
    await db.collection("transactions").insertOne({
      userId: payload.userId,
      type: "withdrawal",
      amount: amt,
      method,
      walletAddress,
      status: "pending",
      createdAt: new Date(),
    });

    // Notify admin
    const userName = user.username || user.fullName || "User";
    try {
      await Promise.all([
        // Admin notification
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER!,
          subject: `💸 New Withdrawal Request — ${userName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">New Withdrawal Request</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>User</b></td><td style="padding:8px;border:1px solid #ddd;">${userName}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Email</b></td><td style="padding:8px;border:1px solid #ddd;">${user.email}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Amount</b></td><td style="padding:8px;border:1px solid #ddd;">$${amt.toFixed(2)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Method</b></td><td style="padding:8px;border:1px solid #ddd;">${method}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Wallet</b></td><td style="padding:8px;border:1px solid #ddd;font-family:monospace;font-size:12px;">${walletAddress}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Remaining Balance</b></td><td style="padding:8px;border:1px solid #ddd;">$${newBalance.toFixed(2)}</td></tr>
              </table>
            </div>
          `,
        }),
        // User confirmation
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Withdrawal Request Received 🕐",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">Withdrawal Request Received</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>We have received your withdrawal request. Please be patient as our team is currently processing it.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Amount</b></td><td style="padding:8px;border:1px solid #ddd;">$${amt.toFixed(2)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Method</b></td><td style="padding:8px;border:1px solid #ddd;">${method}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Wallet Address</b></td><td style="padding:8px;border:1px solid #ddd;font-family:monospace;font-size:12px;">${walletAddress}</td></tr>
              </table>
              <p style="color:#666;font-size:13px;">If you did not initiate this request, please contact our support team immediately.</p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        }),
      ]);
    } catch (e) {
      console.error("Withdrawal mail error:", e);
    }

    return NextResponse.json({ success: true, newBalance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Fetch pending withdrawals grouped by method
export async function GET() {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );

    const pending = await db
      .collection("transactions")
      .find({ userId: payload.userId, type: "withdrawal", status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      balance: user?.balance ?? 0,
      withdrawalSettings: user?.withdrawalSettings ?? {},
      withdrawals: pending.map((w) => ({
        id: w._id.toString(),
        amount: w.amount,
        method: w.method,
        walletAddress: w.walletAddress,
        status: w.status,
        createdAt: w.createdAt?.toISOString() ?? "",
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}