import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Delete user
    await db.collection("users").deleteOne({ _id: new ObjectId(payload.userId) });

    // Notify admin
    try {
      await transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER!,
        subject: "⚠️ User Account Deleted",
        html: `
          <div style="font-family:sans-serif; max-width:600px;">
            <h2 style="color:#c0392b;">User Account Deleted</h2>
            <p>The following user has deleted their account:</p>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Name</b></td>
                <td style="padding:8px; border:1px solid #ddd;">${user.username || user.fullName || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Email</b></td>
                <td style="padding:8px; border:1px solid #ddd;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Joined</b></td>
                <td style="padding:8px; border:1px solid #ddd;">${user.createdAt?.toLocaleDateString?.() ?? "N/A"}</td>
              </tr>
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Balance at deletion</b></td>
                <td style="padding:8px; border:1px solid #ddd;">$${user.balance ?? 0}</td>
              </tr>
            </table>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Delete account mail error:", mailErr);
    }

    // Clear cookie
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}