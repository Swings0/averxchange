import Link from "next/link";
import { TrendingUp, Clock } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  amount: number;
  profit: number;
  status: string;
  startDate: string;
  endDate: string;
}

export default function ActivePlans({ plans }: { plans: Plan[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white/70 uppercase tracking-widest mb-4">
        Active Plan(s){" "}
        <span className="text-white/30 normal-case font-normal tracking-normal">
          ({plans.length})
        </span>
      </h2>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-white/20" />
          </div>
          <p className="text-white/30 text-sm mb-5">
            You do not have an active investment plan at the moment.
          </p>
          <Link
            href="/dashboard/trading-plans"
            className="inline-block bg-white text-[#080f1a] text-sm font-bold px-7 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
          >
            Buy a plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-white">{plan.name}</p>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {plan.status}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-white/50">
                  Amount:{" "}
                  <span className="text-white font-medium">${plan.amount.toLocaleString()}</span>
                </span>
                <span className="text-white/50">
                  Profit:{" "}
                  <span className="text-emerald-400 font-medium">${plan.profit.toLocaleString()}</span>
                </span>
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(plan.startDate).toLocaleDateString()}
                </span>
                <span>→ {new Date(plan.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}