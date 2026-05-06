import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getApiTokenPayload } from "@/lib/apiAuth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";
import { PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const payload = await getApiTokenPayload(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId, amount } = await req.json();
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt !== plan.price) {
      return NextResponse.json({ error: `This plan requires exactly $${plan.price.toLocaleString()}` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const activePlanCount = await db.collection("plans").countDocuments({
      userId: payload.userId, status: "active",
    });
    if (activePlanCount >= 5) {
      return NextResponse.json({ error: "Maximum of 5 active plans allowed." }, { status: 400 });
    }

    const balance = user.balance ?? 0;
    if (amt > balance) {
      return NextResponse.json({ error: "Insufficient balance. Please deposit funds first." }, { status: 400 });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);
    const newBalance = parseFloat((balance - amt).toFixed(2));

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { balance: newBalance } }
    );

    await db.collection("plans").insertOne({
      userId: payload.userId,
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
    try {
      await Promise.all([
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER!,
          subject: `📈 New Plan Purchase — ${userName}`,
          html: `<div style="font-family:sans-serif;max-width:600px;">
            <h2>New Plan Purchase</h2>
            <p><b>User:</b> ${userName} (${user.email})</p>
            <p><b>Plan:</b> ${plan.name}</p>
            <p><b>Amount:</b> $${plan.price.toLocaleString()}</p>
            <p><b>Total Profit:</b> $${plan.totalProfit.toLocaleString()}</p>
            <p><b>Duration:</b> ${plan.duration} days</p>
            <p><b>End Date:</b> ${endDate.toLocaleDateString()}</p>
          </div>`,
        }),
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `🚀 ${plan.name} Activated!`,
          html: `<div style="font-family:sans-serif;max-width:600px;">
            <h2>Investment Plan Activated!</h2>
            <p>Hi <b>${userName}</b>,</p>
            <p>Your <b>${plan.name}</b> has been activated. You'll earn $${plan.totalProfit.toLocaleString()} over ${plan.duration} days.</p>
            <p>Completion Date: ${endDate.toLocaleDateString()}</p>
            <p>— The Aver Exchange Team</p>
          </div>`,
        }),
      ]);
    } catch (e) { console.error("Plan email error:", e); }

    return NextResponse.json({ success: true, newBalance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}