import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getApiTokenPayload } from "@/lib/apiAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getApiTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await db.collection("users").deleteOne({ _id: new ObjectId(payload.userId) });

    try {
      await transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER!,
        subject: "⚠️ User Account Deleted",
        html: `<div style="font-family:sans-serif;max-width:600px;">
          <h2 style="color:#c0392b;">User Account Deleted</h2>
          <p><b>Name:</b> ${user.username || user.fullName || "N/A"}</p>
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Balance at deletion:</b> $${user.balance ?? 0}</p>
        </div>`,
      });
    } catch (e) { console.error("Delete account mail error:", e); }

    const res = NextResponse.json({ success: true });
    res.cookies.set("token", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}