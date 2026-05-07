"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Package, Clock } from "lucide-react";
import { PLANS } from "@/lib/plans";

interface ActivePlan {
  id: string;
  name: string;
  planId: string;
  price: number;
  totalProfit: number;
  dailyProfit: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: string;
}

function Countdown({ endDate }: { endDate: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setLabel("Completing..."); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return <span className="font-mono text-amber-400 text-xs">{label}</span>;
}

export default function ActivePlans() {
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my-plans", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h2 className="text-base font-semibold text-white/70 uppercase tracking-widest mb-4">
        Active Plan(s){" "}
        <span className="text-white/30 normal-case font-normal tracking-normal">
          ({plans.length})
        </span>
      </h2>

      {loading ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-white/20" />
          </div>
          <p className="text-white/30 text-sm mb-4">
            You do not have an active investment plan at the moment.
          </p>
          <Link
            href="/dashboard/purchase-plan"
            className="inline-block bg-white text-[#080f1a] text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
          >
            Buy a plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const config = PLANS.find((p) => p.id === plan.planId);
            const gradient = config?.color ?? "from-cyan-500 to-blue-600";
            const border = config?.border ?? "border-cyan-500/30";
            const now = Date.now();
            const start = new Date(plan.startDate).getTime();
            const end = new Date(plan.endDate).getTime();
            const progress = Math.min(100, ((now - start) / (end - start)) * 100);

            return (
              <div key={plan.id} className={`rounded-2xl border ${border} overflow-hidden bg-white/[0.03]`}>
                <div className={`bg-gradient-to-r ${gradient} p-4`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Package size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{plan.name}</p>
                      <p className="text-xs text-white/60">${plan.price.toLocaleString()} invested</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Expected profit</span>
                    <span className="text-emerald-400 font-semibold">+${plan.totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-white/40"><Clock size={11} />Remaining</span>
                    <Countdown endDate={plan.endDate} />
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                      style={{ width: `${Math.max(2, progress)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {plans.length > 0 && (
        <div className="mt-3 text-right">
          <Link href="/dashboard/my-plans" className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors">
            View all plans →
          </Link>
        </div>
      )}
    </section>
  );
}