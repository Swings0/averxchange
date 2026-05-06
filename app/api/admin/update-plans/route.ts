import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAdminApiPayload } from "@/lib/apiAuth";
import { PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getAdminApiPayload(req);
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, plans, delayMs } = await req.json();

    if (!email || !plans || !Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (plans.length > 5) {
      return NextResponse.json({ error: "Maximum 5 plans allowed" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userId = user._id.toString();
    const delay = parseInt(delayMs) || 0;
    const startAt = new Date(Date.now() + delay);
    const isInstant = delay === 0;

    const planDocs = plans.map((p: any) => {
      const planConfig = PLANS.find((pl) => pl.id === p.planId || pl.name === p.planName);
      const name = p.planName || planConfig?.name || "Custom Plan";
      const planId = p.planId || planConfig?.id || "custom";
      const price = parseFloat(p.price || planConfig?.price || 0);
      const totalProfit = parseFloat(p.totalProfit || planConfig?.totalProfit || 0);
      const dailyProfit = parseFloat(p.dailyProfit || planConfig?.dailyProfit || 0);
      const profitPct = parseFloat(p.profitPct || planConfig?.profitPct || 0);
      const durationSeconds = parseInt(p.durationSeconds || 0);
      const durationDays = parseInt(p.durationDays || planConfig?.duration || 21);
      const durationMs = durationSeconds > 0
        ? durationSeconds * 1000
        : durationDays * 24 * 60 * 60 * 1000;
      const endDate = new Date(startAt.getTime() + durationMs);

      return {
        userId, email, planId, name, price, totalProfit, dailyProfit, profitPct,
        duration: durationDays, durationMs, source: "admin",
        status: isInstant ? "active" : "pending",
        startDate: startAt, endDate,
        lastAccrualDate: isInstant ? new Date() : null,
        accruedProfit: 0, createdAt: new Date(),
      };
    });

    await db.collection("plans").insertMany(planDocs);

    return NextResponse.json({
      success: true,
      message: isInstant
        ? `${plans.length} plan(s) activated immediately for ${email}`
        : `${plans.length} plan(s) will activate at ${startAt.toLocaleString()}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}