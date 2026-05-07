import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import {
  sendDepositNotificationToAdmin,
  sendDepositConfirmationToUser,
} from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const formData = await req.formData();

    const amount = formData.get("amount") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const proofFile = formData.get("proof") as File | null;

    if (!amount || !paymentMethod || !proofFile) {
      return NextResponse.json(
        {
          error:
            "Amount, payment method and proof are required",
        },
        { status: 400 }
      );
    }

    if (parseFloat(amount) < 5) {
      return NextResponse.json(
        { error: "Minimum deposit is $5" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await proofFile.arrayBuffer();
    const proofBase64 =
      Buffer.from(arrayBuffer).toString("base64");

    const proofMimeType = proofFile.type;
    const proofFileName = proofFile.name;

    const client = await clientPromise;
    const db = client.db();

    // ✅ FIXED ObjectId usage
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userName = user.username || user.fullName || "User";
    const userEmail = user.email;

    // Save transaction
    await db.collection("transactions").insertOne({
      userId: new ObjectId(userId),
      type: "deposit",
      amount: parseFloat(amount),
      paymentMethod,
      walletAddress,
      status: "pending",
      proofFileName,
      createdAt: new Date(),
    });

    // Emails (non-blocking)
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
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}