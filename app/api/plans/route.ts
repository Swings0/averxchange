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
      $or: [{ userId }, { userId: userObjectId }],
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

    const userName = user.username || user.fullName || "User";
    const purchasedAt = now.toLocaleString();

    // ── MAIL ADMIN ─────────────────────────────
    try {
      await transporter.sendMail({
        from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🟢 New Plan Purchase — ${plan.name}`,
        html: `
          <div style="margin:0;padding:40px 20px;background:#0b1120;font-family:Arial,sans-serif;color:#e5e7eb;">
            <div style="max-width:680px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:24px;overflow:hidden;">

              <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
                <h1 style="margin:0;font-size:28px;color:#ffffff;">
                  📈 New Investment Plan Purchase
                </h1>
                <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">
                  A user has successfully activated a new plan.
                </p>
              </div>

              <div style="padding:32px;">
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;">
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">User</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;font-weight:600;">
                        ${userName}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Email</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${user.email}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Plan</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${plan.name}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Amount</td>
                      <td style="padding:8px 0;text-align:right;color:#22c55e;font-weight:700;">
                        $${plan.price.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Daily Profit</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        $${plan.dailyProfit.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Total Profit</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        $${plan.totalProfit.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Duration</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${plan.duration} days
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Purchased At</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${purchasedAt}
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
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
          <div style="margin:0;padding:40px 20px;background:#0b1120;font-family:Arial,sans-serif;color:#e5e7eb;">
            <div style="max-width:680px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:24px;overflow:hidden;">

              <div style="background:linear-gradient(135deg,#06b6d4,#2563eb);padding:36px;text-align:center;">
                <div style="font-size:42px;margin-bottom:12px;">🚀</div>
                <h1 style="margin:0;font-size:28px;color:#ffffff;">
                  Plan Activated Successfully
                </h1>
                <p style="margin:10px 0 0;color:#dbeafe;font-size:15px;">
                  Your investment is now live and earning.
                </p>
              </div>

              <div style="padding:32px;">
                <p style="margin:0 0 16px;font-size:15px;color:#d1d5db;">
                  Hi <strong style="color:#ffffff;">${userName}</strong>,
                </p>

                <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#d1d5db;">
                  Congratulations! Your <strong style="color:#ffffff;">${plan.name}</strong>
                  investment plan has been successfully activated and is now visible
                  in your dashboard.
                </p>

                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:24px;margin:24px 0;">
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Plan</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;font-weight:600;">
                        ${plan.name}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Investment</td>
                      <td style="padding:8px 0;text-align:right;color:#22c55e;font-weight:700;">
                        $${plan.price.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Daily Profit</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        $${plan.dailyProfit.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Total Profit</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        $${plan.totalProfit.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">Duration</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        ${plan.duration} days
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;">New Balance</td>
                      <td style="padding:8px 0;text-align:right;color:#ffffff;">
                        $${newBalance.toLocaleString()}
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#d1d5db;">
                  Your earnings will accrue automatically according to your plan schedule.
                </p>

                <div style="background:#052e16;border:1px solid #14532d;border-radius:14px;padding:16px;margin-top:24px;">
                  <p style="margin:0;font-size:14px;color:#bbf7d0;line-height:1.7;">
                    Thank you for investing with Aver Exchange. We're committed to helping
                    you grow your portfolio securely and consistently.
                  </p>
                </div>
              </div>

              <div style="padding:20px 32px;border-top:1px solid #1f2937;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b7280;">
                  © ${new Date().getFullYear()} Aver Exchange. All rights reserved.
                </p>
              </div>
            </div>
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
// import { auth } from "@/lib/auth";
// import { ObjectId } from "mongodb";
// import { PLANS } from "@/lib/plans";
// import { transporter } from "@/lib/mailer";

// export async function POST(req: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = session.user.id;
//     const { planId, amount } = await req.json();

//     const plan = PLANS.find((p) => p.id === planId);

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

//     const client = await clientPromise;
//     const db = client.db();

//     let userObjectId: ObjectId;

//     try {
//       userObjectId = new ObjectId(userId);
//     } catch {
//       return NextResponse.json(
//         { error: "Invalid user session" },
//         { status: 401 }
//       );
//     }

//     const user = await db.collection("users").findOne({
//       _id: userObjectId,
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const activePlanCount = await db.collection("plans").countDocuments({
//       $or: [
//         { userId },
//         { userId: userObjectId },
//       ],
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

//     await db.collection("users").updateOne(
//       { _id: userObjectId },
//       { $set: { balance: newBalance } }
//     );

//     await db.collection("plans").insertOne({
//       userId, // IMPORTANT: store as string
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

//     // ── MAIL ADMIN ─────────────────────────────
//     try {
//       await transporter.sendMail({
//         from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//         to: process.env.ADMIN_EMAIL,
//         subject: `🟢 New Plan Purchase — ${plan.name}`,
//         html: `
//           <div style="font-family:sans-serif;max-width:600px;">
//             <h2>New Investment Plan Purchase</h2>

//             <p><b>User:</b> ${user.username || user.fullName || "User"}</p>
//             <p><b>Email:</b> ${user.email}</p>

//             <hr />

//             <p><b>Plan:</b> ${plan.name}</p>
//             <p><b>Amount:</b> $${plan.price.toLocaleString()}</p>
//             <p><b>Daily Profit:</b> $${plan.dailyProfit.toLocaleString()}</p>
//             <p><b>Total Profit:</b> $${plan.totalProfit.toLocaleString()}</p>
//             <p><b>Duration:</b> ${plan.duration} days</p>

//             <hr />

//             <p><b>Purchased At:</b> ${now.toLocaleString()}</p>
//           </div>
//         `,
//       });
//     } catch (e) {
//       console.error("Admin purchase mail error:", e);
//     }

//     // ── MAIL USER ─────────────────────────────
//     try {
//       await transporter.sendMail({
//         from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: `✅ ${plan.name} Purchased Successfully`,
//         html: `
//           <div style="font-family:sans-serif;max-width:600px;">
//             <h2 style="color:#0f2744;">Plan Purchased Successfully!</h2>

//             <p>Hi <b>${user.username || user.fullName || "User"}</b>,</p>

//             <p>
//               Your investment plan purchase was successful.
//             </p>

//             <hr />

//             <p><b>Plan:</b> ${plan.name}</p>
//             <p><b>Amount:</b> $${plan.price.toLocaleString()}</p>
//             <p><b>Daily Profit:</b> $${plan.dailyProfit.toLocaleString()}</p>
//             <p><b>Total Profit:</b> $${plan.totalProfit.toLocaleString()}</p>
//             <p><b>Duration:</b> ${plan.duration} days</p>

//             <hr />

//             <p>
//               Your plan is now active and visible in your dashboard.
//             </p>

//             <p>— Aver Exchange Team</p>
//           </div>
//         `,
//       });
//     } catch (e) {
//       console.error("User purchase mail error:", e);
//     }

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