import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendAdminMail, sendWelcomeMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const existing = await db
      .collection("users")
      .findOne({ email: body.email });

    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(body.password, 10);

    await db.collection("users").insertOne({
      ...body,
      password: hashed,
      createdAt: new Date(),
    });

    // EMAILS


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