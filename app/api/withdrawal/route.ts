import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth"; // ✅ NextAuth v5
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { amount, method, walletAddress, password } = await req.json();

    if (!amount || !method || !walletAddress || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal is $100" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const currentBalance = user.balance ?? 0;

    if (amt > currentBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const newBalance = parseFloat((currentBalance - amt).toFixed(2));

    // Deduct balance immediately
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { balance: newBalance } }
    );

    // Save withdrawal as pending
    await db.collection("transactions").insertOne({
      userId,
      type: "withdrawal",
      amount: amt,
      method,
      walletAddress,
      status: "pending",
      createdAt: new Date(),
    });

    const userName = user.username || user.fullName || "User";

    try {
      await Promise.all([
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER!,
          subject: `💸 New Withdrawal Request — ${userName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2>New Withdrawal Request</h2>
              <p><b>User:</b> ${userName}</p>
              <p><b>Email:</b> ${user.email}</p>
              <p><b>Amount:</b> $${amt.toFixed(2)}</p>
              <p><b>Method:</b> ${method}</p>
              <p><b>Wallet:</b> ${walletAddress}</p>
              <p><b>Remaining Balance:</b> $${newBalance.toFixed(2)}</p>
            </div>
          `,
        }),

        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Withdrawal Request Received 🕐",
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2>Withdrawal Request Received</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Your withdrawal is being processed.</p>
              <p><b>Amount:</b> $${amt.toFixed(2)}</p>
              <p><b>Method:</b> ${method}</p>
              <p><b>Wallet:</b> ${walletAddress}</p>
            </div>
          `,
        }),
      ]);
    } catch (mailErr) {
      console.error("Withdrawal mail error:", mailErr);
    }

    return NextResponse.json({ success: true, newBalance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==============================
// GET (NextAuth version)
// ==============================
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    const pending = await db
      .collection("transactions")
      .find({
        userId,
        type: "withdrawal",
        status: "pending",
      })
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
    console.error("WITHDRAWAL GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}