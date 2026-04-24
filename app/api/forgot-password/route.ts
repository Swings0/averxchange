import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        resetToken: token,
        resetTokenExpiry: Date.now() + 1000 * 60 * 15,
      },
    }
  );

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:#06b6d4;">Reset Your Password</h2>
        <p>You requested to reset your password.</p>

        <a href="${resetUrl}" 
            style="
            display:inline-block;
            margin-top:15px;
            padding:10px 20px;
            background:#06b6d4;
            color:#000;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
            ">
            Reset Password
        </a>

        <p style="margin-top:20px; font-size:12px; color:#888;">
            This link expires in 15 minutes.
        </p>

        <p style="font-size:12px; color:#888;">
            If you didn't request this, ignore this email.
        </p>
        </div>
    `,
    });

  return NextResponse.json({ message: "Reset link sent to email" });
}