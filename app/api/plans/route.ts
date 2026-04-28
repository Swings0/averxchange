import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getTokenPayload } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { transporter } from "@/lib/mailer";

const PLANS = [
  { id: "bronze",   name: "Bronze Plan",   min: 500,   max: 1200,  profit: 9,    duration: 14 },
  { id: "silver",   name: "Silver Plan",   min: 1000,  max: 2100,  profit: 10,   duration: 14 },
  { id: "gold",     name: "Gold Plan",     min: 2000,  max: 5200,  profit: 11.5, duration: 21 },
  { id: "platinum", name: "Platinum Plan", min: 5000,  max: 15000, profit: 12,   duration: 21 },
  { id: "diamond",  name: "Diamond Plan",  min: 10000, max: 20000, profit: 13.5, duration: 21 },
  { id: "elite",    name: "Elite Plan",    min: 20000, max: 40000, profit: 14.5, duration: 30 },
  { id: "legacy",   name: "Legacy Plan",   min: 40000, max: 50000, profit: 15.5, duration: 30 },
];

export async function POST(req: NextRequest) {
  try {
    const payload = await getTokenPayload();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId, amount } = await req.json();

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });

    const amt = parseFloat(amount);
    if (isNaN(amt)) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    if (amt < plan.min || amt > plan.max) {
      return NextResponse.json(
        { error: `Amount must be between $${plan.min.toLocaleString()} and $${plan.max.toLocaleString()} for the ${plan.name}.` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const balance = user.balance ?? 0;
    if (amt > balance) {
      return NextResponse.json({ error: "Insufficient balance. Please deposit funds first." }, { status: 400 });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.duration);
    const newBalance = parseFloat((balance - amt).toFixed(2));

    // Deduct balance
    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      { $set: { balance: newBalance } }
    );

    // Save plan as active
    await db.collection("plans").insertOne({
      userId: payload.userId,
      planId: plan.id,
      name: plan.name,
      amount: amt,
      profit: plan.profit,
      duration: plan.duration,
      status: "active",
      startDate: now,
      endDate,
      createdAt: now,
    });

    const userName = user.username || user.fullName || "User";

    // Emails
    try {
      await Promise.all([
        // Admin
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER!,
          subject: `📈 New Plan Purchase — ${userName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">New Investment Plan Purchase</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>User</b></td><td style="padding:8px;border:1px solid #ddd;">${userName}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Email</b></td><td style="padding:8px;border:1px solid #ddd;">${user.email}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Plan</b></td><td style="padding:8px;border:1px solid #ddd;">${plan.name}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Amount</b></td><td style="padding:8px;border:1px solid #ddd;">$${amt.toLocaleString()}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Daily Profit</b></td><td style="padding:8px;border:1px solid #ddd;">${plan.profit}%</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Duration</b></td><td style="padding:8px;border:1px solid #ddd;">${plan.duration} days</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Start Date</b></td><td style="padding:8px;border:1px solid #ddd;">${now.toLocaleDateString()}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>End Date</b></td><td style="padding:8px;border:1px solid #ddd;">${endDate.toLocaleDateString()}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Remaining Balance</b></td><td style="padding:8px;border:1px solid #ddd;">$${newBalance.toLocaleString()}</td></tr>
              </table>
            </div>
          `,
        }),
        // User
        transporter.sendMail({
          from: `"Aver Exchange" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `🚀 Investment Plan Activated — ${plan.name}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#0f2744;">Investment Plan Purchase Successful!</h2>
              <p>Hi <b>${userName}</b>,</p>
              <p>Your investment plan has been received. Our team is currently processing your package and it will be activated shortly.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Plan</b></td><td style="padding:8px;border:1px solid #ddd;">${plan.name}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Amount Invested</b></td><td style="padding:8px;border:1px solid #ddd;">$${amt.toLocaleString()}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Daily Profit</b></td><td style="padding:8px;border:1px solid #ddd;">${plan.profit}% per day</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Duration</b></td><td style="padding:8px;border:1px solid #ddd;">${plan.duration} days</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><b>Expected End Date</b></td><td style="padding:8px;border:1px solid #ddd;">${endDate.toLocaleDateString()}</td></tr>
              </table>
              <p style="color:#666;font-size:13px;">If you have any questions, contact our support team.</p>
              <p>— The Aver Exchange Team</p>
            </div>
          `,
        }),
      ]);
    } catch (e) {
      console.error("Plan purchase mail error:", e);
    }

    return NextResponse.json({ success: true, newBalance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}