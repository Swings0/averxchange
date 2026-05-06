import { NextRequest, NextResponse } from "next/server";
import { getApiTokenPayload } from "@/lib/apiAuth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const payload = await getApiTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, category, message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userName = user.username || user.fullName || "User";

    await Promise.all([
      transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: "Supportaverexchange@gmail.com",
        replyTo: user.email,
        subject: `[Support] ${subject || "General Inquiry"} — ${userName}`,
        html: `<div style="font-family:sans-serif;max-width:600px;">
          <h2>New Support Message</h2>
          <p><b>Name:</b> ${userName}</p>
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Category:</b> ${category || "General"}</p>
          <p><b>Subject:</b> ${subject || "No subject"}</p>
          <div style="background:#f4f6f8;border-left:4px solid #0f2744;padding:16px;margin-top:12px;">
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
        </div>`,
      }),
      transporter.sendMail({
        from: `"Aver Exchange Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "We received your message ✅",
        html: `<div style="font-family:sans-serif;max-width:600px;">
          <h2>Support Request Received</h2>
          <p>Hi <b>${userName}</b>,</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p>For urgent matters: <b>support@averexchange.com</b></p>
          <p>— The Aver Exchange Support Team</p>
        </div>`,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}