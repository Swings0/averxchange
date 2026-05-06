import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db();

    await db.collection("plans").updateOne(
      { _id: new ObjectId(planId) },
      { $set: { status: "removed" } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}