import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
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
    const now = new Date();

    // Apply scheduled stat updates
    const pendingUpdates = await db
      .collection("scheduledUpdates")
      .find({
        userId,
        applied: false,
        applyAt: { $lte: now },
      })
      .toArray();

    for (const u of pendingUpdates) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            [u.field]: u.value,
          },
        }
      );

      await db.collection("scheduledUpdates").updateOne(
        { _id: u._id },
        {
          $set: {
            applied: true,
          },
        }
      );
    }

    // Activate pending plans whose start time has arrived
    await db.collection("plans").updateMany(
      {
        $or: [
          { userId },
          { userId: new ObjectId(userId) },
        ],
        status: "pending",
        startDate: { $lte: now },
      },
      {
        $set: {
          status: "active",
          lastAccrualDate: now,
        },
      }
    );

    // Only ACTIVE plans can expire.
    // Paused plans are intentionally ignored because their endDate
    // gets shifted forward when resumed.
    const expiredPlans = await db
      .collection("plans")
      .find({
        $or: [
          { userId },
          { userId: new ObjectId(userId) },
        ],
        status: "active",
        endDate: { $lte: now },
      })
      .toArray();

    if (expiredPlans.length > 0) {
        const totalProfitToCredit = expiredPlans.reduce(
          (sum, p) => sum + (p.totalProfit ?? 0),
          0
        );

        const expiredIds = expiredPlans.map((p) => p._id);

        await db.collection("plans").updateMany(
          {
            _id: {
              $in: expiredIds,
            },
          },
          {
            $set: {
              status: "expired",
            },
          }
        );

        await db.collection("users").updateOne(
          {
            _id: new ObjectId(userId),
          },
          {
            $inc: {
              balance: totalProfitToCredit,
              totalProfit: totalProfitToCredit,
            },
          }
        );
    }

    // Return both ACTIVE and PAUSED plans
    const plans = await db
      .collection("plans")
      .find({
        $or: [
          { userId },
          { userId: new ObjectId(userId) },
        ],
        status: {
          $in: ["active", "paused"],
        },
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    const user = await db.collection("users").findOne(
      {
        _id: new ObjectId(userId),
      },
      {
        projection: {
          balance: 1,
          totalProfit: 1,
        },
      }
    );

    return NextResponse.json({
      plans: plans.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        planId: p.planId,
        price: p.price ?? 0,
        totalProfit: p.totalProfit ?? 0,
        dailyProfit: p.dailyProfit ?? 0,
        profitPct: p.profitPct ?? 0,
        duration: p.duration ?? 21,
        source: p.source ?? "user",
        startDate: p.startDate?.toISOString() ?? now.toISOString(),
        endDate: p.endDate?.toISOString() ?? now.toISOString(),
        status: p.status, // active | paused
        pausedAt: p.pausedAt?.toISOString() ?? null,
      })),
      balance: user?.balance ?? 0,
      totalProfit: user?.totalProfit ?? 0,
    });
  } catch (err) {
    console.error("GET /api/my-plans error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { auth } from "@/lib/auth";
// import { ObjectId } from "mongodb";

// export async function GET() {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = session.user.id;

//     const client = await clientPromise;
//     const db = client.db();
//     const now = new Date();

//     const pendingUpdates = await db
//       .collection("scheduledUpdates")
//       .find({
//         userId,
//         applied: false,
//         applyAt: { $lte: now },
//       })
//       .toArray();

//     for (const u of pendingUpdates) {
//       await db.collection("users").updateOne(
//         { _id: new ObjectId(userId) },
//         { $set: { [u.field]: u.value } }
//       );

//       await db.collection("scheduledUpdates").updateOne(
//         { _id: u._id },
//         { $set: { applied: true } }
//       );
//     }

//     await db.collection("plans").updateMany(
//       {
//         $or: [
//           { userId },
//           { userId: new ObjectId(userId) },
//         ],
//         status: "pending",
//         startDate: { $lte: now },
//       },
//       {
//         $set: {
//           status: "active",
//           lastAccrualDate: now,
//         },
//       }
//     );

//     const expiredPlans = await db
//       .collection("plans")
//       .find({
//         $or: [
//           { userId },
//           { userId: new ObjectId(userId) },
//         ],
//         status: "active",
//         endDate: { $lte: now },
//       })
//       .toArray();

//     if (expiredPlans.length > 0) {
//       const totalProfitToCredit = expiredPlans.reduce(
//         (sum, p) => sum + (p.totalProfit ?? 0),
//         0
//       );

//       const expiredIds = expiredPlans.map((p) => p._id);

//       await db.collection("plans").updateMany(
//         { _id: { $in: expiredIds } },
//         { $set: { status: "expired" } }
//       );

//       await db.collection("users").updateOne(
//         { _id: new ObjectId(userId) },
//         {
//           $inc: {
//             balance: totalProfitToCredit,
//             totalProfit: totalProfitToCredit,
//           },
//         }
//       );
//     }

// const activePlans = await db
//   .collection("plans")
//   .find({
//     $or: [
//       { userId },
//       { userId: new ObjectId(userId) },
//     ],
//     status: { $in: ["active", "paused"] },
//   })
//   .sort({ createdAt: -1 })
//   .toArray();

//     const user = await db.collection("users").findOne(
//       { _id: new ObjectId(userId) },
//       { projection: { balance: 1, totalProfit: 1 } }
//     );

//     return NextResponse.json({
//       plans: activePlans.map((p) => ({
//         id: p._id.toString(),
//         name: p.name,
//         planId: p.planId,
//         price: p.price ?? 0,
//         totalProfit: p.totalProfit ?? 0,
//         dailyProfit: p.dailyProfit ?? 0,
//         profitPct: p.profitPct ?? 0,
//         duration: p.duration ?? 21,
//         source: p.source ?? "user",
//         startDate: p.startDate?.toISOString() ?? now.toISOString(),
//         endDate: p.endDate?.toISOString() ?? now.toISOString(),
//         status: p.status,
//       })),
//       balance: user?.balance ?? 0,
//       totalProfit: user?.totalProfit ?? 0,
//     });

//   } catch (err) {
//     console.error("GET /api/my-plans error:", err);

//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }







