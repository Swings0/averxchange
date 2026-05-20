"use client";

import { useState, useEffect } from "react";
import AccountSummary from "@/components/dashboard/AccountSummary";
import ActivePlans from "@/components/dashboard/ActivePlans";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ReferralCard from "@/components/dashboard/ReferralCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

interface UserData {
  displayName: string;
  balance: number;
  totalProfit: number;
  bonus: number;
  tradingAccounts: number;
  referralBonus: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalEarned: number;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
}

interface ActivePlan {
  dailyProfit: number;
  startDate: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, txRes, plansRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/transactions"),
          fetch("/api/my-plans"),
          { credentials: "include" },
          { METHOD: "GET" },
        ]);

        const me = await meRes.json();
        const tx = await txRes.json();
        const plans = await plansRes.json();

        // Sum earned so far across all active plans (same logic as PlanCard)
        const totalEarned = (plans.plans ?? []).reduce(
          (sum: number, p: ActivePlan) => {
            const start = new Date(p.startDate).getTime();
            const daysElapsed = Math.max(
              0,
              Math.floor((Date.now() - start) / 86400000)
            );
            return sum + p.dailyProfit * daysElapsed;
          },
          0
        );

        setUser({
          displayName: me.displayName || "User",
          balance: me.balance ?? 0,
          totalProfit: me.totalProfit ?? 0,
          bonus: me.bonus ?? 0,
          tradingAccounts: me.tradingAccounts ?? 0,
          referralBonus: me.referralBonus ?? 0,
          totalDeposit: me.totalDeposit ?? 0,
          totalWithdrawal: me.totalWithdrawal ?? 0,
          totalEarned,
        });

        const recent = (tx.transactions ?? []).slice(0, 5);
        setTransactions(recent);
        setHasActivePlan((plans.plans ?? []).length > 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome, {user?.displayName}!
        </h1>
        <p className="text-white/40 text-sm mt-1">Here&apos;s your account overview</p>
      </div>

      <WelcomeBanner hasActivePlan={hasActivePlan} />

      <AccountSummary
        balance={user?.balance ?? 0}
        totalProfit={user?.totalProfit ?? 0}
        bonus={user?.bonus ?? 0}
        tradingAccounts={user?.tradingAccounts ?? 0}
        referralBonus={user?.referralBonus ?? 0}
        totalDeposit={user?.totalDeposit ?? 0}
        totalWithdrawal={user?.totalWithdrawal ?? 0}
        totalEarned={user?.totalEarned ?? 0}
      />

      <ActivePlans />

      <ReferralCard />

      <RecentTransactions transactions={transactions} />
    </div>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import AccountSummary from "@/components/dashboard/AccountSummary";
// import ActivePlans from "@/components/dashboard/ActivePlans";
// import RecentTransactions from "@/components/dashboard/RecentTransactions";
// import ReferralCard from "@/components/dashboard/ReferralCard";
// import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

// interface UserData {
//   displayName: string;
//   balance: number;
//   totalProfit: number;
//   bonus: number;
//   tradingAccounts: number;
//   referralBonus: number;
//   totalDeposit: number;
//   totalWithdrawal: number;
// }

// interface Transaction {
//   id: string;
//   date: string;
//   type: string;
//   amount: number;
//   status: string;
// }

// export default function DashboardPage() {
//   const [user, setUser] = useState<UserData | null>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [hasActivePlan, setHasActivePlan] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [meRes, txRes, plansRes] = await Promise.all([
//           fetch("/api/me"),
//           fetch("/api/transactions"),
//           fetch("/api/my-plans"),
//           { credentials: "include" },
//           { METHOD: "GET" },
//         ]);

//         const me = await meRes.json();
//         const tx = await txRes.json();
//         const plans = await plansRes.json();

//         setUser({
//           displayName: me.displayName || "User",
//           balance: me.balance ?? 0,
//           totalProfit: me.totalProfit ?? 0,
//           bonus: me.bonus ?? 0,
//           tradingAccounts: me.tradingAccounts ?? 0,
//           referralBonus: me.referralBonus ?? 0,
//           totalDeposit: me.totalDeposit ?? 0,
//           totalWithdrawal: me.totalWithdrawal ?? 0,
//         });

//         const recent = (tx.transactions ?? []).slice(0, 5);
//         setTransactions(recent);
//         setHasActivePlan((plans.plans ?? []).length > 0);
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-2xl font-bold text-white tracking-tight">
//           Welcome, {user?.displayName}!
//         </h1>
//         <p className="text-white/40 text-sm mt-1">Here&apos;s your account overview</p>
//       </div>

//       <WelcomeBanner hasActivePlan={hasActivePlan} />

//       <AccountSummary
//         balance={user?.balance ?? 0}
//         totalProfit={user?.totalProfit ?? 0}
//         bonus={user?.bonus ?? 0}
//         tradingAccounts={user?.tradingAccounts ?? 0}
//         referralBonus={user?.referralBonus ?? 0}
//         totalDeposit={user?.totalDeposit ?? 0}
//         totalWithdrawal={user?.totalWithdrawal ?? 0}
//       />

//       <ActivePlans />

//       <ReferralCard />

//       <RecentTransactions transactions={transactions} />
//     </div>
//   );
// }