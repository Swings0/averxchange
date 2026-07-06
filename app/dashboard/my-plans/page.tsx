"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Clock, Package, BarChart2, Zap, Calendar, RefreshCw, PauseCircle } from "lucide-react";
import { PLANS } from "@/lib/plans";

interface ActivePlan {
  id: string;
  name: string;
  planId: string;
  price: number;
  totalProfit: number;
  dailyProfit: number;
  profitPct: number;
  duration: number;
  source: string;
  startDate: string;
  endDate: string;
  status: string;
}

// ─── Countdown hook ───────────────────────────────────────────────
function useCountdown(endDate: string, paused: boolean) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (paused) { setTimeLeft("On hold"); return; }
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Completing..."); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate, paused]);
  return timeLeft;
}

// ─── Plan Card ────────────────────────────────────────────────────
function PlanCard({ plan }: { plan: ActivePlan }) {
  const config = PLANS.find((p) => p.id === plan.planId);
  const gradient = config?.color ?? "from-cyan-500 to-blue-600";
  const border = config?.border ?? "border-cyan-500/30";

  const isPaused = plan.status === "paused";

  const now = Date.now();
  const start = new Date(plan.startDate).getTime();
  const end = new Date(plan.endDate).getTime();
  const totalDuration = end - start;
  const elapsed = Math.max(0, Math.min(now - start, totalDuration));
  const progress = Math.min(100, (elapsed / totalDuration) * 100);
  const daysTotal = Math.max(1, Math.round(totalDuration / 86400000));
  const daysElapsed = Math.max(0, Math.floor(elapsed / 86400000));
  const countdown = useCountdown(plan.endDate, isPaused);
  const earnedSoFar = parseFloat((plan.dailyProfit * daysElapsed).toFixed(2));

  return (
    <div className={`rounded-2xl border ${isPaused ? "border-amber-500/30" : border} overflow-hidden bg-white/[0.03]`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${isPaused ? "from-amber-500/20 to-orange-600/20" : gradient} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isPaused
                ? <PauseCircle size={20} className="text-white" />
                : <Package size={20} className="text-white" />}
            </div>
            <div>
              <p className="font-bold text-white text-base">{plan.name}</p>
              <p className="text-white/60 text-xs">
                ${plan.price.toLocaleString()} invested
                {plan.source === "admin" && (
                  <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Admin</span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            {/* ── NEW: Plan on hold label ── */}
            {isPaused ? (
              <p className="text-sm font-bold text-rose-400 flex items-center gap-1 justify-end">
                <PauseCircle size={14} /> Plan on hold
              </p>
            ) : (
              <>
                <p className="text-xs text-white/60">Expected Profit</p>
                <p className="text-sm font-bold text-white">+${plan.totalProfit.toLocaleString()}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40 mb-1">Daily</p>
            <p className="text-sm font-bold text-emerald-400">+${plan.dailyProfit.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40 mb-1">Earned</p>
            <p className="text-sm font-bold text-cyan-400">${earnedSoFar.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40 mb-1">Duration</p>
            <p className="text-sm font-bold text-white">{daysTotal}d</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-white/40 mb-1">Return</p>
            <p className="text-sm font-bold text-white">${(plan.price + plan.totalProfit).toLocaleString()}</p>
          </div>
        </div>

        {/* Countdown / Paused notice */}
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isPaused ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/5"}`}>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className={isPaused ? "text-amber-400" : "text-amber-400"} />
            <span className={isPaused ? "text-amber-400" : "text-white/50"}>
              {isPaused ? "Plan paused" : "Time Remaining"}
            </span>
          </div>
          <span className={`text-sm font-bold font-mono ${isPaused ? "text-rose-400" : "text-amber-400"}`}>
            {countdown}
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Day {daysElapsed} of {daysTotal}</span>
            <span>{progress.toFixed(1)}% complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isPaused ? "bg-amber-400/50" : `bg-gradient-to-r ${gradient}`}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-white/30">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            Started: {new Date(plan.startDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            Ends: {new Date(plan.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function MyPlansPage() {
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/my-plans");
      const data = await res.json();
      setPlans(data.plans ?? []);
      setBalance(data.balance ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    const id = setInterval(() => fetchPlans(), 30000);
    return () => clearInterval(id);
  }, []);

  const totalDailyProfit = plans
    .filter((p) => p.status !== "paused")
    .reduce((s, p) => s + p.dailyProfit, 0);

  const pausedCount = plans.filter((p) => p.status === "paused").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Investment Plans</h1>
          <p className="text-white/40 text-sm mt-1">
            Profit is automatically credited to your balance when each plan completes
          </p>
        </div>
        <button
          onClick={() => fetchPlans(true)}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Active Plans</p>
              <p className="text-2xl font-bold text-cyan-400">{plans.length}/5</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-cyan-400" />
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Combined Daily</p>
              <p className="text-2xl font-bold text-emerald-400">+${totalDailyProfit.toLocaleString()}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Zap size={20} className="text-emerald-400" />
            </div>
          </div>
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Account Balance</p>
              <p className="text-2xl font-bold text-violet-400">
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <BarChart2 size={20} className="text-violet-400" />
            </div>
          </div>
        </div>
      )}

      {/* Paused notice banner */}
      {pausedCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3">
          <PauseCircle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            {pausedCount} plan{pausedCount > 1 ? "s are" : " is"} currently on hold. Contact support if you have questions.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <TrendingUp size={28} className="text-white/20" />
          </div>
          <p className="text-white/30 text-sm mb-2">
            You do not have an investment plan at the moment.
          </p>
          <Link
            href="/dashboard/trading-plans"
            className="inline-block mt-4 bg-white text-[#080f1a] text-sm font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            Buy a plan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}



// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { TrendingUp, Clock, Package, BarChart2, Zap, Calendar, RefreshCw } from "lucide-react";
// import { PLANS } from "@/lib/plans";

// interface ActivePlan {
//   id: string;
//   name: string;
//   planId: string;
//   price: number;
//   totalProfit: number;
//   dailyProfit: number;
//   profitPct: number;
//   duration: number;
//   source: string;
//   startDate: string;
//   endDate: string;
//   status: string;
// }

// // ─── Countdown hook ───────────────────────────────────────────────
// function useCountdown(endDate: string) {
//   const [timeLeft, setTimeLeft] = useState("");
//   useEffect(() => {
//     const tick = () => {
//       const diff = new Date(endDate).getTime() - Date.now();
//       if (diff <= 0) { setTimeLeft("Completing..."); return; }
//       const d = Math.floor(diff / 86400000);
//       const h = Math.floor((diff % 86400000) / 3600000);
//       const m = Math.floor((diff % 3600000) / 60000);
//       const s = Math.floor((diff % 60000) / 1000);
//       setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
//     };
//     tick();
//     const id = setInterval(tick, 1000);
//     return () => clearInterval(id);
//   }, [endDate]);
//   return timeLeft;
// }

// // ─── Plan Card ────────────────────────────────────────────────────
// function PlanCard({ plan }: { plan: ActivePlan }) {
//   const config = PLANS.find((p) => p.id === plan.planId);
//   const gradient = config?.color ?? "from-cyan-500 to-blue-600";
//   const border = config?.border ?? "border-cyan-500/30";
//   const badge = config?.badge ?? "bg-cyan-500/20 text-cyan-300";

//   const now = Date.now();
//   const start = new Date(plan.startDate).getTime();
//   const end = new Date(plan.endDate).getTime();
//   const totalDuration = end - start;
//   const elapsed = Math.max(0, Math.min(now - start, totalDuration));
//   const progress = Math.min(100, (elapsed / totalDuration) * 100);
//   const daysTotal = Math.max(1, Math.round(totalDuration / 86400000));
//   const daysElapsed = Math.max(0, Math.floor(elapsed / 86400000));
//   const countdown = useCountdown(plan.endDate);
//   const earnedSoFar = parseFloat(((plan.dailyProfit * daysElapsed)).toFixed(2));

//   return (
//     <div className={`rounded-2xl border ${border} overflow-hidden bg-white/3`}>
//       {/* Header */}
//       <div className={`bg-linear-to-r ${gradient} p-5`}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
//               <Package size={20} className="text-white" />
//             </div>
//             <div>
//               <p className="font-bold text-white text-base">{plan.name}</p>
//               <p className="text-white/60 text-xs">
//                 ${plan.price.toLocaleString()} invested
//                 {plan.source === "admin" && (
//                   <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Admin</span>
//                 )}
//               </p>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-xs text-white/60">Expected Profit</p>
//             <p className="text-sm font-bold text-white">+${plan.totalProfit.toLocaleString()}</p>
//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="p-5 space-y-4">
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           <div className="bg-white/5 rounded-xl p-3 text-center">
//             <p className="text-xs text-white/40 mb-1">Daily</p>
//             <p className="text-sm font-bold text-emerald-400">+${plan.dailyProfit.toLocaleString()}</p>
//           </div>
//           <div className="bg-white/5 rounded-xl p-3 text-center">
//             <p className="text-xs text-white/40 mb-1">Earned</p>
//             <p className="text-sm font-bold text-cyan-400">${earnedSoFar.toLocaleString()}</p>
//           </div>
//           <div className="bg-white/5 rounded-xl p-3 text-center">
//             <p className="text-xs text-white/40 mb-1">Duration</p>
//             <p className="text-sm font-bold text-white">{daysTotal}d</p>
//           </div>
//           <div className="bg-white/5 rounded-xl p-3 text-center">
//             <p className="text-xs text-white/40 mb-1">Return</p>
//             <p className="text-sm font-bold text-white">${(plan.price + plan.totalProfit).toLocaleString()}</p>
//           </div>
//         </div>

//         {/* Countdown */}
//         <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
//           <div className="flex items-center gap-2 text-white/50 text-sm">
//             <Clock size={14} className="text-amber-400" />
//             Time Remaining
//           </div>
//           <span className="text-sm font-bold text-amber-400 font-mono">{countdown}</span>
//         </div>

//         {/* Progress */}
//         <div>
//           <div className="flex justify-between text-xs text-white/40 mb-2">
//             <span>Day {daysElapsed} of {daysTotal}</span>
//             <span>{progress.toFixed(1)}% complete</span>
//           </div>
//           <div className="h-2 bg-white/10 rounded-full overflow-hidden">
//             <div
//               className={`h-full bg-linear-to-r ${gradient} rounded-full transition-all duration-1000`}
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>

//         {/* Dates */}
//         <div className="flex items-center justify-between text-xs text-white/30">
//           <span className="flex items-center gap-1">
//             <Calendar size={11} />
//             Started: {new Date(plan.startDate).toLocaleDateString()}
//           </span>
//           <span className="flex items-center gap-1">
//             <Calendar size={11} />
//             Ends: {new Date(plan.endDate).toLocaleDateString()}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────
// export default function MyPlansPage() {
//   const [plans, setPlans] = useState<ActivePlan[]>([]);
//   const [balance, setBalance] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchPlans = async (showRefresh = false) => {
//     if (showRefresh) setRefreshing(true);
//     try {
//       const res = await fetch("/api/my-plans");
//       const data = await res.json();
//       setPlans(data.plans ?? []);
//       setBalance(data.balance ?? 0);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchPlans();
//     // Poll every 30s to catch expirations
//     const id = setInterval(() => fetchPlans(), 30000);
//     return () => clearInterval(id);
//   }, []);

//   const totalDailyProfit = plans.reduce((s, p) => s + p.dailyProfit, 0);

//   return (
//     <div className="max-w-5xl mx-auto space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">
//             My Investment Plans (All)
//           </h1>
//           <p className="text-white/40 text-sm mt-1">
//             Profit is automatically credited to your balance when each plan completes
//           </p>
//         </div>
//         <button
//           onClick={() => fetchPlans(true)}
//           className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5"
//         >
//           <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
//           Refresh
//         </button>
//       </div>

//       {/* Summary cards — only show when plans exist */}
//       {plans.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Active Plans</p>
//               <p className="text-2xl font-bold text-cyan-400">{plans.length}/5</p>
//             </div>
//             <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
//               <TrendingUp size={20} className="text-cyan-400" />
//             </div>
//           </div>
//           <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Combined Daily</p>
//               <p className="text-2xl font-bold text-emerald-400">
//                 +${totalDailyProfit.toLocaleString()}
//               </p>
//             </div>
//             <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
//               <Zap size={20} className="text-emerald-400" />
//             </div>
//           </div>
//           <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5 flex items-center justify-between">
//             <div>
//               <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Account Balance</p>
//               <p className="text-2xl font-bold text-violet-400">
//                 ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//             <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
//               <BarChart2 size={20} className="text-violet-400" />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Plans */}
//       {loading ? (
//         <div className="flex items-center justify-center py-20">
//           <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : plans.length === 0 ? (
//         <div className="rounded-2xl border border-white/6 bg-white/3 p-16 text-center">
//           <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
//             <TrendingUp size={28} className="text-white/20" />
//           </div>
//           <p className="text-white/30 text-sm mb-2">
//             You do not have an investment plan at the moment or no value match your query.
//           </p>
//           <Link
//             href="/dashboard/purchase-plan"
//             className="inline-block mt-4 bg-white text-[#080f1a] text-sm font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
//           >
//             Buy a plan
//           </Link>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {plans.map((plan) => (
//             <PlanCard key={plan.id} plan={plan} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }