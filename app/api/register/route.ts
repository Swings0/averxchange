import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendAdminMail, sendWelcomeMail } from "@/lib/mailer";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db();

    // Check existing user
    const existing = await db.collection("users").findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(body.password, 10);

    // Generate unique referral code for new user
    const referralCode = body.username || randomBytes(4).toString("hex");

    // Handle referral — find referrer by referralId or username
    let referredBy: string | null = null;
    if (body.referralId && body.referralId.trim() !== "") {
      const referrer = await db.collection("users").findOne({
        $or: [
          { referralCode: body.referralId.trim() },
          { username: body.referralId.trim() },
        ],
      });

      if (referrer) {
        referredBy = referrer._id.toString();

        // Credit $5 bonus to referrer
        await db.collection("users").updateOne(
          { _id: referrer._id },
          {
            $inc: { balance: 5, referralBonus: 5 },
          }
        );
      }
    }

    // Insert new user
    await db.collection("users").insertOne({
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      phone: body.phone,
      country: body.country,
      password: hashed,
      referralCode,
      referredBy,
      balance: 0,
      totalProfit: 0,
      bonus: 0,
      tradingAccounts: 0,
      referralBonus: 0,
      totalDeposit: 0,
      totalWithdrawal: 0,
      createdAt: new Date(),
    });

    try {
      await sendAdminMail(body);
      await sendWelcomeMail(body);
    } catch (mailErr) {
      console.log("Mail error:", mailErr);
    }

    return NextResponse.json({ message: "Success" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}