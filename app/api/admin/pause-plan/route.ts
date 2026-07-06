import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminPayload();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId, action } = await req.json();
    // action: "pause" | "resume"

    if (!planId || !["pause", "resume"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const plan = await db.collection("plans").findOne({ _id: new ObjectId(planId) });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    if (action === "pause") {
      // Save the current status so we can restore it on resume
      await db.collection("plans").updateOne(
        { _id: new ObjectId(planId) },
        {
          $set: {
            status: "paused",
            pausedAt: new Date(),
            previousStatus: plan.status, // store previous status (active/pending)
          },
        }
      );
      return NextResponse.json({ success: true, message: "Plan paused" });
    }

    if (action === "resume") {
      await db.collection("plans").updateOne(
        { _id: new ObjectId(planId) },
        {
          $set: {
            status: plan.previousStatus || "active",
            resumedAt: new Date(),
          },
          $unset: { pausedAt: "", previousStatus: "" },
        }
      );
      return NextResponse.json({ success: true, message: "Plan resumed" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}