import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminPayload } from "@/lib/adminAuth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminPayload();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planId, action } = await req.json();

    if (!planId || !["pause", "resume"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const plan = await db.collection("plans").findOne({
      _id: new ObjectId(planId),
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // ==========================
    // PAUSE PLAN
    // ==========================

    if (action === "pause") {
      if (plan.status === "paused") {
        return NextResponse.json({
          success: true,
          message: "Plan is already paused",
        });
      }

      await db.collection("plans").updateOne(
        { _id: new ObjectId(planId) },
        {
          $set: {
            status: "paused",
            pausedAt: new Date(),
            previousStatus: plan.status,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Plan paused",
      });
    }

    // ==========================
    // RESUME PLAN
    // ==========================

    if (action === "resume") {
      if (plan.status !== "paused") {
        return NextResponse.json({
          success: true,
          message: "Plan is already active",
        });
      }

      if (!plan.pausedAt) {
        return NextResponse.json(
          { error: "Pause timestamp missing" },
          { status: 400 }
        );
      }

      const now = new Date();
      const pausedAt = new Date(plan.pausedAt);

      // Total milliseconds spent paused
      const pausedDuration =
        now.getTime() - pausedAt.getTime();

      const updates: any = {
        status: plan.previousStatus || "active",
        resumedAt: now,
        startDate: new Date(
          new Date(plan.startDate).getTime() + pausedDuration
        ),
        endDate: new Date(
          new Date(plan.endDate).getTime() + pausedDuration
        ),
      };

      // Shift last accrual forward too
      if (plan.lastAccrualDate) {
        updates.lastAccrualDate = new Date(
          new Date(plan.lastAccrualDate).getTime() +
            pausedDuration
        );
      }

      await db.collection("plans").updateOne(
        { _id: new ObjectId(planId) },
        {
          $set: updates,
          $unset: {
            pausedAt: "",
            previousStatus: "",
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Plan resumed",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}



// import { NextRequest, NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { getAdminPayload } from "@/lib/adminAuth";
// import { ObjectId } from "mongodb";

// export async function POST(req: NextRequest) {
//   try {
//     const admin = await getAdminPayload();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { planId, action } = await req.json();
//     // action: "pause" | "resume"

//     if (!planId || !["pause", "resume"].includes(action)) {
//       return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db();

//     const plan = await db.collection("plans").findOne({ _id: new ObjectId(planId) });
//     if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

//     if (action === "pause") {
//       // Save the current status so we can restore it on resume
//       await db.collection("plans").updateOne(
//         { _id: new ObjectId(planId) },
//         {
//           $set: {
//             status: "paused",
//             pausedAt: new Date(),
//             previousStatus: plan.status, // store previous status (active/pending)
//           },
//         }
//       );
//       return NextResponse.json({ success: true, message: "Plan paused" });
//     }

//     if (action === "resume") {
//       await db.collection("plans").updateOne(
//         { _id: new ObjectId(planId) },
//         {
//           $set: {
//             status: plan.previousStatus || "active",
//             resumedAt: new Date(),
//           },
//           $unset: { pausedAt: "", previousStatus: "" },
//         }
//       );
//       return NextResponse.json({ success: true, message: "Plan resumed" });
//     }
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }