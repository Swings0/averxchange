import { NextRequest, NextResponse } from "next/server";
import { getTokenPayload } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, category, message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userName = user.username || user.fullName || "User";
    const userEmail = user.email;

    // Mail support team
    await transporter.sendMail({
      from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
      to: "Supportaverexchange@gmail.com",
      replyTo: userEmail,
      subject: `[Support] ${subject || "General Inquiry"} — ${userName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;">
          <h2 style="color:#0f2744;">New Support Message</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Name</b></td><td style="padding:8px;border:1px solid #ddd;">${userName}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Email</b></td><td style="padding:8px;border:1px solid #ddd;">${userEmail}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Category</b></td><td style="padding:8px;border:1px solid #ddd;">${category || "General"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Subject</b></td><td style="padding:8px;border:1px solid #ddd;">${subject || "No subject"}</td></tr>
          </table>
          <div style="background:#f4f6f8;border-left:4px solid #0f2744;padding:16px;border-radius:4px;">
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:16px;">Reply directly to this email to respond to the user.</p>
        </div>
      `,
    });

    // Confirmation to user
    await transporter.sendMail({
      from: `"Aver Exchange Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "We received your message ✅",
      html: `
        <div style="font-family:sans-serif;max-width:600px;">
          <h2 style="color:#0f2744;">Support Request Received</h2>
          <p>Hi <b>${userName}</b>,</p>
          <p>We've received your support message and our team will get back to you within 24 hours.</p>
          <p>For urgent matters, you can also reach us directly at <b>support@averexchange.com</b></p>
          <p>— The Aver Exchange Support Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}