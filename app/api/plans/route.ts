import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { PLANS } from "@/lib/plans";
import { transporter } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { planId, amount } = await req.json();

    const plan = PLANS.find((p) => p.id === planId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amt = Number(amount);

    if (isNaN(amt) || amt !== plan.price) {
      return NextResponse.json(
        { error: `This plan requires exactly $${plan.price}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    let userObjectId: ObjectId;

    try {
      userObjectId = new ObjectId(userId);
    } catch {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 }
      );
    }

    const user = await db.collection("users").findOne({
      _id: userObjectId,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activePlanCount = await db.collection("plans").countDocuments({
      $or: [
        { userId },
        { userId: userObjectId },
      ],
      status: "active",
    });

    if (activePlanCount >= 5) {
      return NextResponse.json(
        { error: "Maximum of 5 active plans allowed" },
        { status: 400 }
      );
    }

    const balance = user.balance ?? 0;

    if (amt > balance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const now = new Date();

    const endDate = new Date(
      now.getTime() + plan.duration * 24 * 60 * 60 * 1000
    );

    const newBalance = balance - amt;

    await db.collection("users").updateOne(
      { _id: userObjectId },
      { $set: { balance: newBalance } }
    );

    await db.collection("plans").insertOne({
      userId, // IMPORTANT: store as string
      planId: plan.id,
      name: plan.name,
      price: plan.price,
      totalProfit: plan.totalProfit,
      dailyProfit: plan.dailyProfit,
      profitPct: plan.profitPct,
      duration: plan.duration,
      status: "active",
      source: "user",
      startDate: now,
      endDate,
      lastAccrualDate: now,
      accruedProfit: 0,
      createdAt: now,
    });

    // ── MAIL ADMIN ─────────────────────────────
    try {
      await transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🟢 New Plan Purchase — ${plan.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2>New Investment Plan Purchase</h2>

            <p><b>User:</b> ${user.username || user.fullName || "User"}</p>
            <p><b>Email:</b> ${user.email}</p>

            <hr />

            <p><b>Plan:</b> ${plan.name}</p>
            <p><b>Amount:</b> $${plan.price.toLocaleString()}</p>
            <p><b>Daily Profit:</b> $${plan.dailyProfit.toLocaleString()}</p>
            <p><b>Total Profit:</b> $${plan.totalProfit.toLocaleString()}</p>
            <p><b>Duration:</b> ${plan.duration} days</p>

            <hr />

            <p><b>Purchased At:</b> ${now.toLocaleString()}</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Admin purchase mail error:", e);
    }

    // ── MAIL USER ─────────────────────────────
    try {
      await transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `✅ ${plan.name} Purchased Successfully`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#0f2744;">Plan Purchased Successfully!</h2>

            <p>Hi <b>${user.username || user.fullName || "User"}</b>,</p>

            <p>
              Your investment plan purchase was successful.
            </p>

            <hr />

            <p><b>Plan:</b> ${plan.name}</p>
            <p><b>Amount:</b> $${plan.price.toLocaleString()}</p>
            <p><b>Daily Profit:</b> $${plan.dailyProfit.toLocaleString()}</p>
            <p><b>Total Profit:</b> $${plan.totalProfit.toLocaleString()}</p>
            <p><b>Duration:</b> ${plan.duration} days</p>

            <hr />

            <p>
              Your plan is now active and visible in your dashboard.
            </p>

            <p>— Aver Exchange Team</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("User purchase mail error:", e);
    }

    return NextResponse.json({
      success: true,
      newBalance,
    });

  } catch (err) {
    console.error("plans error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { auth } from "@/lib/auth"; // NextAuth v5 style
// import { ObjectId } from "mongodb";

// export async function POST(req: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = session.user.id;
//     const { planId, amount } = await req.json();

//     const client = await clientPromise;
//     const db = client.db();

//     const plan = await db.collection("plans_meta").findOne({ id: planId });

//     if (!plan) {
//       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//     }

//     const amt = Number(amount);

//     if (isNaN(amt) || amt !== plan.price) {
//       return NextResponse.json(
//         { error: `This plan requires exactly $${plan.price}` },
//         { status: 400 }
//       );
//     }

//     // ✅ FIXED ObjectId usage
//     const user = await db.collection("users").findOne({
//       _id: new ObjectId(userId),
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // max active plans check
//     const activePlanCount = await db.collection("plans").countDocuments({
//       userId: new ObjectId(userId),
//       status: "active",
//     });

//     if (activePlanCount >= 5) {
//       return NextResponse.json(
//         { error: "Maximum of 5 active plans allowed" },
//         { status: 400 }
//       );
//     }

//     const balance = user.balance ?? 0;

//     if (amt > balance) {
//       return NextResponse.json(
//         { error: "Insufficient balance" },
//         { status: 400 }
//       );
//     }

//     const now = new Date();
//     const endDate = new Date(
//       now.getTime() + plan.duration * 24 * 60 * 60 * 1000
//     );

//     const newBalance = balance - amt;

//     // deduct balance
//     await db.collection("users").updateOne(
//       { _id: new ObjectId(userId) },
//       { $set: { balance: newBalance } }
//     );

//     // create plan
//     await db.collection("plans").insertOne({
//       userId: new ObjectId(userId), // ✅ FIXED TYPE SAFETY
//       planId: plan.id,
//       name: plan.name,
//       price: plan.price,
//       totalProfit: plan.totalProfit,
//       dailyProfit: plan.dailyProfit,
//       profitPct: plan.profitPct,
//       duration: plan.duration,
//       status: "active",
//       source: "user",
//       startDate: now,
//       endDate,
//       lastAccrualDate: now,
//       accruedProfit: 0,
//       createdAt: now,
//     });

//     return NextResponse.json({
//       success: true,
//       newBalance,
//     });
//   } catch (err) {
//     console.error("plans error:", err);
//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     );
//   }
// }