import { redirect } from "next/navigation";
import { getTokenPayload } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import AccountSummary from "@/components/dashboard/AccountSummary";
import ActivePlans from "@/components/dashboard/ActivePlans";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ReferralCard from "@/components/dashboard/ReferralCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

export default async function DashboardPage() {
  const payload = await getTokenPayload();
  if (!payload) redirect("/login");

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne(
    { _id: new ObjectId(payload.userId) },
    { projection: { password: 0 } }
  );

  if (!user) redirect("/login");

  // Show approved deposits + all withdrawals (pending + approved) in recent transactions
  const transactions = await db
    .collection("transactions")
    .find({
      userId: payload.userId,
      $or: [
        { type: "deposit", status: "approved" },
        { type: "withdrawal" },
        { type: "transfer_out", status: "approved" },
        { type: "transfer_in", status: "approved" },
      ],
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const displayName = user.username || user.fullName || "User";

  // Check if user has any active plans (for banner)
  const hasActivePlan = await db.collection("plans").countDocuments({
    userId: payload.userId, status: "active",
  }) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome, {displayName}!
        </h1>
        <p className="text-white/40 text-sm mt-1">Here&apos;s your account overview</p>
      </div>

      <WelcomeBanner hasActivePlan={hasActivePlan} />

      <AccountSummary
        balance={user.balance ?? 0}
        totalProfit={user.totalProfit ?? 0}
        bonus={user.bonus ?? 0}
        tradingAccounts={user.tradingAccounts ?? 0}
        referralBonus={user.referralBonus ?? 0}
        totalDeposit={user.totalDeposit ?? 0}
        totalWithdrawal={user.totalWithdrawal ?? 0}
      />

      {/* ActivePlans fetches its own data client-side */}
      <ActivePlans />

      <ReferralCard />

      <RecentTransactions
        transactions={transactions.map((t) => ({
          id: t._id.toString(),
          date: t.createdAt?.toISOString() ?? "",
          type: t.type,
          amount: t.amount ?? 0,
          status: t.status ?? "pending",
        }))}
      />
    </div>
  );
}