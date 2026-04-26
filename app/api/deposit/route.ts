import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";
import {
  sendDepositNotificationToAdmin,
  sendDepositConfirmationToUser,
} from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const amount = formData.get("amount") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const proofFile = formData.get("proof") as File | null;

    // Validate
    if (!amount || !paymentMethod || !proofFile) {
      return NextResponse.json(
        { error: "Amount, payment method and proof are required" },
        { status: 400 }
      );
    }

    if (parseFloat(amount) < 5) {
      return NextResponse.json(
        { error: "Minimum deposit is $5" },
        { status: 400 }
      );
    }

    // Convert proof file to base64
    const arrayBuffer = await proofFile.arrayBuffer();
    const proofBase64 = Buffer.from(arrayBuffer).toString("base64");
    const proofMimeType = proofFile.type;
    const proofFileName = proofFile.name;

    // Fetch user
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = user.username || user.fullName || "User";
    const userEmail = user.email;

    // Save deposit to DB with status "pending"
    await db.collection("transactions").insertOne({
      userId: payload.userId,
      type: "deposit",
      amount: parseFloat(amount),
      paymentMethod,
      walletAddress,
      status: "pending",
      proofFileName,
      createdAt: new Date(),
    });

    // Send emails (non-blocking — don't fail the request if mail fails)
    try {
      await Promise.all([
        sendDepositNotificationToAdmin({
          userName,
          userEmail,
          amount,
          paymentMethod,
          walletAddress,
          proofBase64,
          proofMimeType,
          proofFileName,
        }),
        sendDepositConfirmationToUser({
          userName,
          userEmail,
          amount,
          paymentMethod,
        }),
      ]);
    } catch (mailErr) {
      console.error("Deposit mail error:", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Deposit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}