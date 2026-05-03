import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // =========================
    // 1. EMAIL TO USER
    // =========================
    await transporter.sendMail({
      from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Successfully Subscribed 🎉",
      html: `
        <div style="font-family:Arial;padding:20px;">
          <h2 style="color:#06b6d4;">Welcome to Aver Exchange 🚀</h2>
          <p>You just subscribed to our newsletter.</p>
          <p>You will now receive updates on:</p>
          <ul>
            <li>Hot investment plans</li>
            <li>Market updates</li>
            <li>Platform announcements</li>
          </ul>
          <p style="margin-top:20px;">Glad to have you with us.</p>
        </div>
      `,
    });

    // =========================
    // 2. EMAIL TO ADMIN
    // =========================
    await transporter.sendMail({
      from: `"Aver Newsletter" <${process.env.EMAIL_USER}>`,
      to: "exchangeaver@gmail.com",
      subject: "New Newsletter Subscription",
      text: `i subscribed to the newsletter: ${email}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}