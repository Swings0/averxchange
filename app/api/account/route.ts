import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user
    await db.collection("users").deleteOne({
      _id: new ObjectId(userId),
    });

    // Notify admin (safe try/catch)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO!,
        replyTo: user.email,
        subject: "⚠️ User Account Deleted",
        html: `
          <div style="font-family:sans-serif; max-width:600px;">
            <h2 style="color:#c0392b;">User Account Deleted</h2>
            <p>The following user has deleted their account:</p>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Name</b></td>
                <td style="padding:8px; border:1px solid #ddd;">${
                  user.username || user.fullName || "N/A"
                }</td>
              </tr>
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Email</b></td>
                <td style="padding:8px; border:1px solid #ddd;">${
                  user.email
                }</td>
              </tr>
              <tr>
                <td style="padding:8px; border:1px solid #ddd; background:#f9f9f9;"><b>Balance at deletion</b></td>
                <td style="padding:8px; border:1px solid #ddd;">$${
                  user.balance ?? 0
                }</td>
              </tr>
            </table>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Delete account mail error:", mailErr);
    }

    // ❌ IMPORTANT FIX: do NOT manually clear cookies anymore in NextAuth
    // NextAuth handles session invalidation automatically
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("account delete error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}