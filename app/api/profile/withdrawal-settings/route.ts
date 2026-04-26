import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const allowed = [
      "bankName", "accountName", "accountNumber", "swiftCode",
      "bitcoinAddress", "ethereumAddress", "usdtTrc20Address", "usdtErc20Address", "solanaAddress",
    ];

    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[`withdrawalSettings.${key}`] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}