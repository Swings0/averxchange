import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {getUserFromRequest} from "@/lib/getUserFromRequest";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const payload = await getUserFromRequest();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipientEmail, amount } = await req.json();

    if (!recipientEmail || !amount) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get sender
    const sender = await db.collection("users").findOne({
      _id: new ObjectId(payload.userId),
    });
    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });

    // Prevent self-transfer
    if (sender.email === recipientEmail) {
      return NextResponse.json({ error: "You cannot transfer funds to yourself" }, { status: 400 });
    }

    // Find recipient by email only
    const recipient = await db.collection("users").findOne({ email: recipientEmail });
    if (!recipient) {
      return NextResponse.json({ error: "User does not exist. Please check the email and try again." }, { status: 404 });
    }

    // Check sender balance
    const senderBalance = sender.balance ?? 0;
    if (amt > senderBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const newSenderBalance = parseFloat((senderBalance - amt).toFixed(2));
    const newRecipientBalance = parseFloat(((recipient.balance ?? 0) + amt).toFixed(2));

    // Deduct from sender
    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { balance: newSenderBalance } }
    );

    // Credit recipient
    await db.collection("users").updateOne(
      { _id: recipient._id },
      { $set: { balance: newRecipientBalance } }
    );

    // Log transfer as transactions for both
    const now = new Date();
    await db.collection("transactions").insertMany([
      {
        userId: payload.userId,
        type: "transfer_out",
        amount: amt,
        recipientEmail,
        recipientName: recipient.username || recipient.fullName || "User",
        status: "approved",
        method: "Internal Transfer",
        createdAt: now,
      },
      {
        userId: recipient._id.toString(),
        type: "transfer_in",
        amount: amt,
        senderEmail: sender.email,
        senderName: sender.username || sender.fullName || "User",
        status: "approved",
        method: "Internal Transfer",
        createdAt: now,
      },
    ]);

    return NextResponse.json({
      success: true,
      newBalance: newSenderBalance,
      recipientName: recipient.username || recipient.fullName || "User",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}