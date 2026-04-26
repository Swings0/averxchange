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

  const transactions = await db
    .collection("transactions")
    .find({ userId: payload.userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const activePlans = await db
    .collection("plans")
    .find({ userId: payload.userId, status: "active" })
    .toArray();

  const displayName = user.username || user.fullName || "User";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome, {displayName}!
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Here&apos;s your account overview
        </p>
      </div>

      {/* Dismissible banners */}
      <WelcomeBanner hasActivePlan={activePlans.length > 0} />

      {/* Stats grid */}
      <AccountSummary
        balance={user.balance ?? 0}
        totalProfit={user.totalProfit ?? 0}
        bonus={user.bonus ?? 0}
        tradingAccounts={user.tradingAccounts ?? 0}
        referralBonus={user.referralBonus ?? 0}
        totalDeposit={user.totalDeposit ?? 0}
        totalWithdrawal={user.totalWithdrawal ?? 0}
      />

      {/* Active plans */}
      <ActivePlans
        plans={activePlans.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          amount: p.amount ?? 0,
          profit: p.profit ?? 0,
          status: p.status,
          startDate: p.startDate?.toISOString() ?? "",
          endDate: p.endDate?.toISOString() ?? "",
        }))}
      />

      {/* Referral */}
      <ReferralCard
        referralCode={user.referralCode || ""}
        baseUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
      />

      {/* Recent transactions */}
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