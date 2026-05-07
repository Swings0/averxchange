"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown, CheckCircle2, AlertCircle, Loader2, TrendingUp, Lock,
} from "lucide-react";
import { PLANS, type Plan } from "@/lib/plans";

// ─── Success Modal ────────────────────────────────────────────────
function SuccessModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#0f1f35] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Purchase Successful!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          You have successfully purchased the{" "}
          <span className="text-white font-semibold">{plan.name}</span>.
          Your profit of{" "}
          <span className="text-emerald-400 font-semibold">${plan.totalProfit.toLocaleString()}</span>{" "}
          will be credited to your balance when the plan completes in {plan.duration} days.
        </p>
        <button onClick={onClose}
          className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all">
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function TradingPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [activePlanCount, setActivePlanCount] = useState(0);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState<Plan | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" }).then((r) => r.json()).then((d) => setBalance(d.balance ?? 0));
    fetch("/api/my-plans", { credentials: "include" }).then((r) => r.json()).then((d) => setActivePlanCount(d.plans?.length ?? 0));
  }, []);

  const canBuy = activePlanCount < 5;

  const handleBuy = async () => {
    setError("");
    if (!canBuy) { setError("You have reached the maximum of 5 active plans."); return; }
    if (balance < selectedPlan.price) {
      setError(`Insufficient balance. You need $${selectedPlan.price.toLocaleString()} to purchase this plan.`);
      return;
    }
    setBuying(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id, amount: selectedPlan.price }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setBalance(data.newBalance);
      setActivePlanCount((c) => c + 1);
      setShowSuccess(selectedPlan);
    } catch { setError("Network error. Please try again."); }
    finally { setBuying(false); }
  };

  const dailyEarning = selectedPlan.dailyProfit;
  const totalReturn = selectedPlan.price + selectedPlan.totalProfit;

  return (
    <>
      {showSuccess && <SuccessModal plan={showSuccess} onClose={() => setShowSuccess(null)} />}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Get started with your investment.
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Select a plan and invest — profit is credited when the plan completes
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30 uppercase tracking-wider">Your Balance</p>
            <p className="text-xl font-bold text-white">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Active plan counter */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm ${
          activePlanCount >= 5
            ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
        }`}>
          <TrendingUp size={16} />
          {activePlanCount >= 5
            ? "Maximum 5 active plans reached. Wait for a plan to complete."
            : `${activePlanCount}/5 active plans — ${5 - activePlanCount} slot(s) remaining`}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-6">

              {/* Plan dropdown */}
              <div>
                <label className="text-sm text-white/50 block mb-2">Select Investment Plan</label>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-linear-to-r ${selectedPlan.color}`} />
                      <span className="font-semibold text-white">{selectedPlan.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedPlan.badge}`}>
                        {selectedPlan.profitPct}%/day
                      </span>
                    </div>
                    <ChevronDown size={18} className={`text-white/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1f35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-72 overflow-y-auto">
                      {PLANS.map((plan) => (
                        <button key={plan.id}
                          onClick={() => { setSelectedPlan(plan); setDropdownOpen(false); setError(""); }}
                          className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/10 transition text-left ${selectedPlan.id === plan.id ? "bg-white/10" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full bg-linear-to-r ${plan.color}`} />
                            <span className="text-sm font-medium text-white">{plan.name}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${plan.badge}`}>{plan.profitPct}%/day</span>
                            <p className="text-xs text-white/30 mt-0.5">${plan.price.toLocaleString()} → +${plan.totalProfit.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Plan price display */}
              <div className={`rounded-2xl bg-linear-to-r ${selectedPlan.color} p-5`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Investment</p>
                    <p className="text-xl font-bold text-white">${selectedPlan.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-white">+${selectedPlan.totalProfit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Duration</p>
                    <p className="text-xl font-bold text-white">{selectedPlan.duration} Days</p>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-sm text-white/50 block mb-2">Payment Method</label>
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border bg-linear-to-r ${selectedPlan.color} bg-opacity-10 ${selectedPlan.border}`}>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                  <span className="text-white font-semibold">Account Balance</span>
                  <span className="text-white/60 text-sm ml-auto">
                    ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm text-rose-400">
                  <AlertCircle size={14} className="flex shrink-0" /> {error}
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Details panel ── */}
          <div>
            <div className="rounded-2xl border border-white/6 bg-white/3 overflow-hidden sticky top-20">
              <div className={`bg-linear-to-r ${selectedPlan.color} px-5 py-4`}>
                <p className="text-sm font-bold text-white">Your Investment Details</p>
              </div>
              <div className="p-5 space-y-4">
                <Row label="Plan" value={selectedPlan.name} />
                <Divider />
                <Row label="Duration" value={`${selectedPlan.duration} Days`} />
                <Row label="Daily Profit" value={`${selectedPlan.profitPct}%`} accent="text-emerald-400" />
                <Divider />
                <Row label="Investment" value={`$${selectedPlan.price.toLocaleString()}`} />
                <Row label="Total Profit" value={`+$${selectedPlan.totalProfit.toLocaleString()}`} accent="text-emerald-400" />
                <Row label="Daily Earning" value={`+$${dailyEarning.toLocaleString()}`} accent="text-cyan-400" />
                <Divider />
                <Row label="Total Return" value={`$${totalReturn.toLocaleString()}`} accent="text-white font-bold" />
                <Divider />
                <Row label="Payment Method" value="Account Balance" />
                <Row label="Amount to Invest" value={`$${selectedPlan.price.toLocaleString()}`} />

                <button onClick={handleBuy} disabled={buying || !canBuy}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-linear-to-r ${selectedPlan.color} text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2`}>
                  {!canBuy
                    ? <><Lock size={15} /> Max Plans Reached</>
                    : buying
                      ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      : "Confirm & Invest"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-white/30">{label}</p>
      <p className={`text-sm font-semibold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-white/6" />;
}